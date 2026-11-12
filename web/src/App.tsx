import { useEffect, useRef, useState, type MouseEvent, type ReactElement } from 'react';
import { ChipSynthController } from './audio/chipSynth';
import { CombinatorScreen } from './components/CombinatorScreen';
import { DiagnosticScreen } from './components/DiagnosticScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FermiScreen } from './components/FermiScreen';
import { HeaderShell } from './components/HeaderShell';
import { LobbyScreen } from './components/LobbyScreen';
import { NotFoundSection } from './components/NotFoundSection';
import {
  createInitialCombinatorParams,
  evaluateCombinatorSequence,
  extractInitialParamsMeta,
  stepCombinatorOnce,
} from './domain/combinatorEngine';
import { getCombinatorStage } from './domain/combinatorStages';
import { computeDiagnosticProfile } from './domain/diagnostic';
import { evaluateFermiSelection } from './domain/fermiEngine';
import { getFermiStage } from './domain/fermiStages';
import { resolveRouteFromLocation } from './domain/router';
import { auditAllStages } from './domain/solver';
import type {
  ArcadeTestApi,
  CombinatorStageRecord,
  DiagnosticProfile,
  DiagnosticSharePhase,
  DiagnosticUnlockState,
  FermiBestJudgment,
  FermiStageRecord,
  LobbyProgressPhase,
  Locale,
  PersistedArcadeStateV1,
  ResolvedRoute,
  RouteId,
  ScreenViewModel,
  SimulationSnapshot,
} from './domain/types';
import { t, type DictionaryKey } from './i18n/dictionary';
import { SafeStorageAdapter } from './storage/safeStorage';
import { TelemetryCollector } from './telemetry/telemetry';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const COPY_TOAST_DURATION_MS = 3000;

function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getPageTitleKey(route: RouteId): DictionaryKey {
  switch (route) {
    case 'lobby':
      return 'page.title.lobby';
    case 'combinator':
      return 'page.title.combinator';
    case 'fermi':
      return 'page.title.fermi';
    case 'diagnostic':
      return 'page.title.diagnostic';
    case 'notFound':
      return 'page.title.notFound';
  }
}

function syncDocumentMetadata(route: RouteId, locale: Locale): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.lang = locale;
  document.title = t(locale, getPageTitleKey(route));
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) {
    descMeta.setAttribute('content', t(locale, 'lobby.lead'));
  }
}

function buildLobbyPhase(profile: DiagnosticProfile): LobbyProgressPhase {
  if (profile.rankUnlocked) {
    return { kind: 'rankUnlocked' };
  }
  if (profile.combinatorClearedCount >= 1) {
    return { kind: 'combinatorOnly' };
  }
  if (profile.fermiClearedCount >= 1) {
    return { kind: 'fermiOnly' };
  }
  return { kind: 'empty' };
}

function buildDiagnosticUnlock(
  profile: DiagnosticProfile,
  share: DiagnosticSharePhase,
): DiagnosticUnlockState {
  if (profile.rankUnlocked && profile.overallScore !== null) {
    return {
      kind: 'unlocked',
      profile,
      overallScore: profile.overallScore,
      share,
    };
  }
  if (profile.combinatorClearedCount === 0 && profile.fermiClearedCount === 0) {
    return { kind: 'unrankedBoth', profile };
  }
  if (profile.combinatorClearedCount === 0) {
    return { kind: 'unrankedCombinatorPending', profile };
  }
  return { kind: 'unrankedFermiPending', profile };
}

function createViewModelForRoute(
  resolved: ResolvedRoute,
  persisted: PersistedArcadeStateV1,
): ScreenViewModel {
  switch (resolved.route) {
    case 'lobby': {
      const profile = computeDiagnosticProfile(persisted);
      return {
        screen: 'lobby',
        progressPhase: buildLobbyPhase(profile),
      };
    }
    case 'combinator': {
      const stageId = resolved.stageId ?? 1;
      const stage = getCombinatorStage(stageId);
      return {
        screen: 'combinator',
        stageId: stage.stageId,
        stageFallbackNotice: resolved.stageFallbackNotice,
        execution: {
          kind: 'idle',
          slots: [null, null, null],
          params: createInitialCombinatorParams(stage),
        },
      };
    }
    case 'fermi': {
      const stageId = resolved.stageId ?? 1;
      const stage = getFermiStage(stageId);
      return {
        screen: 'fermi',
        stageId: stage.stageId,
        stageFallbackNotice: resolved.stageFallbackNotice,
        execution: {
          kind: 'idle',
          selectedCardIds: [null, null, null],
        },
      };
    }
    case 'diagnostic': {
      const profile = computeDiagnosticProfile(persisted);
      return {
        screen: 'diagnostic',
        unlock: buildDiagnosticUnlock(profile, { kind: 'idle' }),
      };
    }
    case 'notFound':
      return { screen: 'notFound' };
  }
}

function buildSimulationSnapshot(
  vm: ScreenViewModel,
  persisted: PersistedArcadeStateV1,
): SimulationSnapshot {
  if (vm.screen === 'combinator') {
    const stage = getCombinatorStage(vm.stageId);
    const { execution } = vm;
    const unassignedSlotNames: string[] = [];
    for (let idx = 0; idx < 3; idx += 1) {
      if (execution.slots[idx] === null) {
        unassignedSlotNames.push(`STEP ${String(idx + 1)}`);
      }
    }

    let status: SimulationSnapshot['status'] = 'IDLE';
    let stepIndex = 0;
    let currentShakeOffsetPx = 0;
    let maxShakeOffsetPx = 0;
    let debugLog: SimulationSnapshot['debugLog'] = null;

    switch (execution.kind) {
      case 'idle':
        status = 'IDLE';
        stepIndex = 0;
        break;
      case 'stepping':
        status = 'STEPPING';
        stepIndex = execution.stepIndex;
        break;
      case 'running':
        status = 'RUNNING';
        stepIndex = execution.stepIndex;
        currentShakeOffsetPx = execution.currentShakeOffsetPx;
        maxShakeOffsetPx = execution.maxShakeOffsetPx;
        break;
      case 'cleared':
        status = 'STAGE CLEAR';
        stepIndex = 3;
        maxShakeOffsetPx = execution.maxShakeOffsetPx;
        break;
      case 'crashed':
        status = 'CRASHED';
        stepIndex = execution.stepIndex;
        maxShakeOffsetPx = execution.maxShakeOffsetPx;
        debugLog = execution.debugLog;
        break;
      case 'failed':
        status = 'FAILED';
        stepIndex = 3;
        maxShakeOffsetPx = execution.maxShakeOffsetPx;
        debugLog = execution.debugLog;
        break;
    }

    const stageRecord = persisted.combinatorStages[String(vm.stageId)];
    return {
      activeMode: 'combinator',
      stageId: vm.stageId,
      status,
      stepIndex,
      assignedSlots: [...execution.slots],
      unassignedSlotNames,
      initialParams: extractInitialParamsMeta(stage),
      currentParams: { ...execution.params },
      fermiParams: null,
      officialAttemptCount: persisted.combinatorTotalRuns,
      stageAttemptCount: stageRecord ? stageRecord.totalRunAttempts : 0,
      currentShakeOffsetPx,
      maxShakeOffsetPx,
      debugLog,
      fermiExplanation: null,
    };
  }

  if (vm.screen === 'fermi') {
    const stage = getFermiStage(vm.stageId);
    const { execution } = vm;
    const unassignedSlotNames: string[] = [];
    for (let idx = 0; idx < 3; idx += 1) {
      if (execution.selectedCardIds[idx] === null) {
        unassignedSlotNames.push(`ACT ${String(idx + 1)}`);
      }
    }

    let status: SimulationSnapshot['status'] = 'IDLE';
    let stepIndex = 0;
    let currentShakeOffsetPx = 0;
    let maxShakeOffsetPx = 0;
    let fermiExplanation: SimulationSnapshot['fermiExplanation'] = null;
    let fermiParams: SimulationSnapshot['fermiParams'] = {
      baselineValue: stage.baselineValue,
      estimateValue: null,
      logError: null,
      trapTriggeredCount: 0,
    };

    switch (execution.kind) {
      case 'idle':
        status = 'IDLE';
        stepIndex = 0;
        break;
      case 'running':
        status = 'RUNNING';
        stepIndex = execution.stepIndex;
        currentShakeOffsetPx = execution.currentShakeOffsetPx;
        maxShakeOffsetPx = execution.maxShakeOffsetPx;
        break;
      case 'completed':
        status = execution.judgment;
        stepIndex = 3;
        maxShakeOffsetPx = execution.maxShakeOffsetPx;
        fermiExplanation = execution.explanation;
        fermiParams = {
          baselineValue: execution.explanation.baselineValue,
          estimateValue: execution.explanation.estimateValue,
          logError: execution.explanation.logError,
          trapTriggeredCount: execution.explanation.trapTriggeredCount,
        };
        break;
    }

    const stageRecord = persisted.fermiStages[String(vm.stageId)];
    return {
      activeMode: 'fermi',
      stageId: vm.stageId,
      status,
      stepIndex,
      assignedSlots: [...execution.selectedCardIds],
      unassignedSlotNames,
      initialParams: null,
      currentParams: null,
      fermiParams,
      officialAttemptCount: persisted.fermiTotalFires,
      stageAttemptCount: stageRecord ? stageRecord.totalFireAttempts : 0,
      currentShakeOffsetPx,
      maxShakeOffsetPx,
      debugLog: null,
      fermiExplanation,
    };
  }

  return {
    activeMode: null,
    stageId: null,
    status: 'IDLE',
    stepIndex: 0,
    assignedSlots: [null, null, null],
    unassignedSlotNames: [],
    initialParams: null,
    currentParams: null,
    fermiParams: null,
    officialAttemptCount: 0,
    stageAttemptCount: 0,
    currentShakeOffsetPx: 0,
    maxShakeOffsetPx: 0,
    debugLog: null,
    fermiExplanation: null,
  };
}

interface BootContext {
  readonly storage: SafeStorageAdapter;
  readonly telemetry: TelemetryCollector;
  readonly audio: ChipSynthController;
  readonly initialPersisted: PersistedArcadeStateV1;
  readonly initialViewModel: ScreenViewModel;
  readonly initialCanonicalReplacement: string | null;
  readonly initialStaleSchema: boolean;
}

function createBootContext(onNewerSchema: () => void, onAudioError: () => void): BootContext {
  const nowEpochMs = Date.now();
  const bootPerfMs =
    typeof window !== 'undefined' && typeof window.performance?.now === 'function'
      ? window.performance.now()
      : 0;

  const storage = new SafeStorageAdapter(onNewerSchema);
  const loadOutcome = storage.loadInitial(nowEpochMs);
  const telemetry = new TelemetryCollector(loadOutcome.isFirstVisit, bootPerfMs);
  const audio = new ChipSynthController(loadOutcome.state.soundEnabled, onAudioError);

  const resolved = resolveRouteFromLocation(window.location.pathname, window.location.search);
  const initialViewModel = createViewModelForRoute(resolved, loadOutcome.state);

  telemetry.emitSessionStarted({
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
    locale: loadOutcome.state.locale,
    reducedMotion: isReducedMotionPreferred(),
    nowEpochMs,
  });

  if (loadOutcome.hadStorageException) {
    telemetry.emitClientError('storage', resolved.route, nowEpochMs);
  }

  if (resolved.route === 'combinator' || resolved.route === 'fermi') {
    telemetry.emitStageStarted(resolved.route, resolved.stageId ?? 1, nowEpochMs);
  } else if (resolved.route === 'diagnostic') {
    const profile = computeDiagnosticProfile(loadOutcome.state);
    telemetry.emitDiagnosticViewed({
      combinatorClearedCount: profile.combinatorClearedCount,
      fermiClearedCount: profile.fermiClearedCount,
      overallRank: profile.overallRank,
      nowEpochMs,
    });
  }

  syncDocumentMetadata(resolved.route, loadOutcome.state.locale);

  return {
    storage,
    telemetry,
    audio,
    initialPersisted: loadOutcome.state,
    initialViewModel,
    initialCanonicalReplacement: resolved.stageFallbackNotice ? resolved.canonicalPath : null,
    initialStaleSchema: storage.isNewerSchemaFrozen(),
  };
}

export function App(): ReactElement {
  const activeRouteRef = useRef<RouteId>('lobby');
  const clearedFirstEverInSessionRef = useRef<boolean>(false);
  const simulationTimersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);

  const bootRef = useRef<BootContext | null>(null);
  const [staleTabDetected, setStaleTabDetected] = useState<boolean>(false);
  const [, setStorageTick] = useState<number>(0);

  if (bootRef.current === null) {
    bootRef.current = createBootContext(
      () => setStaleTabDetected(true),
      () => {
        const ctx = bootRef.current;
        if (ctx) {
          ctx.telemetry.emitClientError('audio', activeRouteRef.current, Date.now());
        }
      },
    );
  }

  const boot = bootRef.current;
  const [persisted, setPersisted] = useState<PersistedArcadeStateV1>(boot.initialPersisted);
  const [viewModel, setViewModel] = useState<ScreenViewModel>(boot.initialViewModel);

  const persistedRef = useRef<PersistedArcadeStateV1>(persisted);
  const viewModelRef = useRef<ScreenViewModel>(viewModel);
  persistedRef.current = persisted;
  viewModelRef.current = viewModel;
  activeRouteRef.current = viewModel.screen;

  const commitPersisted = (next: PersistedArcadeStateV1): void => {
    persistedRef.current = next;
    const saved = boot.storage.save(next);
    if (!saved && !boot.storage.isNewerSchemaFrozen()) {
      setStorageTick((n) => n + 1);
    }
    setPersisted(next);
  };

  const commitViewModel = (next: ScreenViewModel): void => {
    viewModelRef.current = next;
    activeRouteRef.current = next.screen;
    setViewModel(next);
  };

  if (typeof window !== 'undefined') {
    const testApi: ArcadeTestApi = {
      getSimulationSnapshot: () =>
        buildSimulationSnapshot(viewModelRef.current, persistedRef.current),
      auditAllStages: () => auditAllStages(),
      getAudioState: () => boot.audio.getSnapshot(),
      getPersistedState: () => boot.storage.getStateSnapshot(),
      getStorageStatus: () => boot.storage.getStatusSnapshot(),
      getDiagnosticProfile: () => computeDiagnosticProfile(persistedRef.current),
      getEmittedEvents: () => boot.telemetry.getEventsSnapshot(),
    };
    window.__ARCADE_TEST_API__ = testApi;
  }

  const clearSimulationTimers = (): void => {
    for (const handle of simulationTimersRef.current) {
      window.clearTimeout(handle);
    }
    simulationTimersRef.current = [];
  };

  const clearToastTimer = (): void => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  const clearAllTimers = (): void => {
    clearSimulationTimers();
    clearToastTimer();
  };

  useEffect(() => {
    if (boot.initialStaleSchema) {
      setStaleTabDetected(true);
    }
    if (boot.initialCanonicalReplacement !== null) {
      window.history.replaceState(null, '', boot.initialCanonicalReplacement);
    }
    const detachStorage = boot.storage.attachCrossTabListener();

    const handlePopState = (): void => {
      clearAllTimers();
      const resolved = resolveRouteFromLocation(window.location.pathname, window.location.search);
      if (resolved.stageFallbackNotice) {
        window.history.replaceState(null, '', resolved.canonicalPath);
      }
      const nextVm = createViewModelForRoute(resolved, persistedRef.current);
      commitViewModel(nextVm);
      syncDocumentMetadata(resolved.route, persistedRef.current.locale);

      const nowMs = Date.now();
      if (resolved.route === 'combinator' || resolved.route === 'fermi') {
        boot.telemetry.emitStageStarted(resolved.route, resolved.stageId ?? 1, nowMs);
      } else if (resolved.route === 'diagnostic') {
        const prof = computeDiagnosticProfile(persistedRef.current);
        boot.telemetry.emitDiagnosticViewed({
          combinatorClearedCount: prof.combinatorClearedCount,
          fermiClearedCount: prof.fermiClearedCount,
          overallRank: prof.overallRank,
          nowEpochMs: nowMs,
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      clearAllTimers();
      detachStorage();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [boot]);

  useEffect(() => {
    syncDocumentMetadata(viewModel.screen, persisted.locale);
  }, [viewModel.screen, persisted.locale]);

  const navigateToHref = (href: string, ev?: MouseEvent<HTMLAnchorElement>): void => {
    if (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) {
        return;
      }
      ev.preventDefault();
    }

    clearAllTimers();
    const targetUrl = new URL(href, window.location.origin);
    const resolved = resolveRouteFromLocation(targetUrl.pathname, targetUrl.search);

    if (resolved.stageFallbackNotice) {
      window.history.replaceState(null, '', resolved.canonicalPath);
    } else {
      const nextUrlText = `${targetUrl.pathname}${targetUrl.search}`;
      if (`${window.location.pathname}${window.location.search}` !== nextUrlText) {
        window.history.pushState(null, '', nextUrlText);
      }
    }

    const nextVm = createViewModelForRoute(resolved, persistedRef.current);
    commitViewModel(nextVm);
    syncDocumentMetadata(resolved.route, persistedRef.current.locale);
    window.scrollTo(0, 0);

    const nowMs = Date.now();
    if (resolved.route === 'combinator' || resolved.route === 'fermi') {
      boot.telemetry.emitStageStarted(resolved.route, resolved.stageId ?? 1, nowMs);
    } else if (resolved.route === 'diagnostic') {
      const prof = computeDiagnosticProfile(persistedRef.current);
      boot.telemetry.emitDiagnosticViewed({
        combinatorClearedCount: prof.combinatorClearedCount,
        fermiClearedCount: prof.fermiClearedCount,
        overallRank: prof.overallRank,
        nowEpochMs: nowMs,
      });
    }
  };

  const handleToggleSound = (): void => {
    const nextEnabled = !persistedRef.current.soundEnabled;
    boot.audio.setSoundEnabled(nextEnabled);
    const nextPersisted: PersistedArcadeStateV1 = {
      ...persistedRef.current,
      soundEnabled: nextEnabled,
    };
    commitPersisted(nextPersisted);
    boot.telemetry.emitAudioToggled(nextEnabled, Date.now());
  };

  const handleSelectLocale = (nextLocale: Locale): void => {
    if (persistedRef.current.locale === nextLocale) {
      return;
    }
    const nextPersisted: PersistedArcadeStateV1 = {
      ...persistedRef.current,
      locale: nextLocale,
    };
    commitPersisted(nextPersisted);
    syncDocumentMetadata(viewModelRef.current.screen, nextLocale);
  };

  const evaluate7dReturnFlag = (
    baseState: PersistedArcadeStateV1,
    nowEpochMs: number,
  ): { readonly isReturn7d: boolean; readonly nextState: PersistedArcadeStateV1 } => {
    if (
      baseState.firstEverClearedAtMs !== null &&
      !baseState.hasRecorded7dReturnPlay &&
      !clearedFirstEverInSessionRef.current &&
      nowEpochMs >= baseState.firstEverClearedAtMs &&
      nowEpochMs - baseState.firstEverClearedAtMs <= SEVEN_DAYS_MS
    ) {
      return {
        isReturn7d: true,
        nextState: {
          ...baseState,
          hasRecorded7dReturnPlay: true,
        },
      };
    }
    return { isReturn7d: false, nextState: baseState };
  };

  /* -------------------- Mode 1: Combinator Handlers -------------------- */

  const handleSelectCombinatorStage = (nextStageId: number): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'combinator' || currentVm.execution.kind === 'running') {
      return;
    }
    clearSimulationTimers();
    const stage = getCombinatorStage(nextStageId);
    const nextPath = `/combinator?stage=${String(stage.stageId)}`;
    if (`${window.location.pathname}${window.location.search}` !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }

    commitViewModel({
      screen: 'combinator',
      stageId: stage.stageId,
      stageFallbackNotice: false,
      execution: {
        kind: 'idle',
        slots: [null, null, null],
        params: createInitialCombinatorParams(stage),
      },
    });
    boot.telemetry.emitStageStarted('combinator', stage.stageId, Date.now());
  };

  const handleToggleCombinatorSlot = (slotIndex: 0 | 1 | 2): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'combinator' || currentVm.execution.kind === 'running') {
      return;
    }
    if (currentVm.execution.slots[slotIndex] === null) {
      return;
    }
    clearSimulationTimers();
    const stage = getCombinatorStage(currentVm.stageId);
    const nextSlots: [string | null, string | null, string | null] = [
      currentVm.execution.slots[0],
      currentVm.execution.slots[1],
      currentVm.execution.slots[2],
    ];
    nextSlots[slotIndex] = null;

    commitViewModel({
      ...currentVm,
      execution: {
        kind: 'idle',
        slots: nextSlots,
        params: createInitialCombinatorParams(stage),
      },
    });
  };

  const handleClickCombinatorModule = (moduleId: string): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'combinator' || currentVm.execution.kind === 'running') {
      return;
    }
    clearSimulationTimers();
    const stage = getCombinatorStage(currentVm.stageId);
    const nextSlots: [string | null, string | null, string | null] = [
      currentVm.execution.slots[0],
      currentVm.execution.slots[1],
      currentVm.execution.slots[2],
    ];

    const existingIdx = nextSlots.indexOf(moduleId);
    if (existingIdx !== -1) {
      nextSlots[existingIdx] = null;
    } else {
      const emptyIdx = nextSlots.indexOf(null);
      if (emptyIdx === -1) {
        return;
      }
      nextSlots[emptyIdx] = moduleId;
    }

    commitViewModel({
      ...currentVm,
      execution: {
        kind: 'idle',
        slots: nextSlots,
        params: createInitialCombinatorParams(stage),
      },
    });
  };

  const handleCombinatorReset = (): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'combinator' || currentVm.execution.kind === 'running') {
      return;
    }
    clearSimulationTimers();
    const stage = getCombinatorStage(currentVm.stageId);
    commitViewModel({
      ...currentVm,
      execution: {
        kind: 'idle',
        slots: [
          currentVm.execution.slots[0],
          currentVm.execution.slots[1],
          currentVm.execution.slots[2],
        ],
        params: createInitialCombinatorParams(stage),
      },
    });
  };

  const handleCombinatorStep = (): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'combinator' || currentVm.execution.kind === 'running') {
      return;
    }
    const [s0, s1, s2] = currentVm.execution.slots;
    if (s0 === null || s1 === null || s2 === null) {
      return;
    }
    if (
      currentVm.execution.kind === 'cleared' ||
      currentVm.execution.kind === 'crashed' ||
      currentVm.execution.kind === 'failed' ||
      (currentVm.execution.kind === 'stepping' && currentVm.execution.stepIndex >= 3)
    ) {
      return;
    }

    const stage = getCombinatorStage(currentVm.stageId);
    const nextStepNum: 1 | 2 | 3 =
      currentVm.execution.kind === 'stepping'
        ? currentVm.execution.stepIndex === 1
          ? 2
          : 3
        : 1;
    const preParams =
      currentVm.execution.kind === 'stepping'
        ? currentVm.execution.params
        : createInitialCombinatorParams(stage);
    const assignedTuple: readonly [string, string, string] = [s0, s1, s2];
    const targetModId = assignedTuple[nextStepNum - 1]!;
    const mod = stage.modules.find((m) => m.id === targetModId);
    if (!mod) {
      return;
    }

    boot.audio.triggerUserGestureCue('step');
    const nowEpochMs = Date.now();
    const nowPerfMs = window.performance.now();
    const prevStageAttempts =
      persistedRef.current.combinatorStages[String(stage.stageId)]?.totalRunAttempts ?? 0;

    boot.telemetry.emitSimulationExecuted({
      mode: 'combinator',
      stageId: stage.stageId,
      executionType: 'step',
      attemptNumber: prevStageAttempts,
      isFirst7dReturnPlay: false,
      nowPerfMs,
      nowEpochMs,
    });

    const frame = stepCombinatorOnce(stage, preParams, mod, nextStepNum);
    if (frame.crashedDebugLog) {
      commitViewModel({
        ...currentVm,
        execution: {
          kind: 'crashed',
          slots: assignedTuple,
          stepIndex: nextStepNum,
          params: frame.paramsAfter,
          debugLog: frame.crashedDebugLog,
          maxShakeOffsetPx: 0,
        },
      });
      return;
    }

    commitViewModel({
      ...currentVm,
      execution: {
        kind: 'stepping',
        slots: assignedTuple,
        stepIndex: nextStepNum,
        params: frame.paramsAfter,
      },
    });
  };

  const handleCombinatorRun = (): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'combinator' || currentVm.execution.kind === 'running') {
      return;
    }
    const [s0, s1, s2] = currentVm.execution.slots;
    if (s0 === null || s1 === null || s2 === null) {
      return;
    }

    clearSimulationTimers();
    const stage = getCombinatorStage(currentVm.stageId);
    const assignedTuple: readonly [string, string, string] = [s0, s1, s2];
    const evalResult = evaluateCombinatorSequence(stage, assignedTuple);

    const reduced = isReducedMotionPreferred();
    const stepDelayMs = reduced ? 110 : 450;
    const shakeAmp = reduced ? 0 : 4;

    boot.audio.triggerUserGestureCue('run');

    const nowEpochMs = Date.now();
    const nowPerfMs = window.performance.now();
    const returnCheck = evaluate7dReturnFlag(persistedRef.current, nowEpochMs);
    if (returnCheck.isReturn7d) {
      commitPersisted(returnCheck.nextState);
    }

    const nextAttemptNum =
      (persistedRef.current.combinatorStages[String(stage.stageId)]?.totalRunAttempts ?? 0) + 1;

    boot.telemetry.emitSimulationExecuted({
      mode: 'combinator',
      stageId: stage.stageId,
      executionType: 'run',
      attemptNumber: nextAttemptNum,
      isFirst7dReturnPlay: returnCheck.isReturn7d,
      nowPerfMs,
      nowEpochMs,
    });

    commitViewModel({
      ...currentVm,
      execution: {
        kind: 'running',
        slots: assignedTuple,
        stepIndex: 0,
        params: createInitialCombinatorParams(stage),
        currentShakeOffsetPx: shakeAmp,
        maxShakeOffsetPx: shakeAmp,
      },
    });

    const totalFrames = evalResult.frames.length;
    const handles: number[] = [];

    for (let idx = 0; idx < totalFrames - 1; idx += 1) {
      const frame = evalResult.frames[idx]!;
      const handle = window.setTimeout(
        () => {
          const liveVm = viewModelRef.current;
          if (liveVm.screen !== 'combinator' || liveVm.stageId !== stage.stageId) {
            return;
          }
          commitViewModel({
            ...liveVm,
            execution: {
              kind: 'running',
              slots: assignedTuple,
              stepIndex: frame.stepNumber,
              params: frame.paramsAfter,
              currentShakeOffsetPx: idx % 2 === 0 ? -shakeAmp : shakeAmp,
              maxShakeOffsetPx: shakeAmp,
            },
          });
        },
        (idx + 1) * stepDelayMs,
      );
      handles.push(handle);
    }

    const finishHandle = window.setTimeout(
      () => {
        simulationTimersRef.current = [];
        const liveVm = viewModelRef.current;
        if (liveVm.screen !== 'combinator' || liveVm.stageId !== stage.stageId) {
          return;
        }

        const finishNowMs = Date.now();
        const prevPersisted = persistedRef.current;
        const stageKey = String(stage.stageId);
        const prevRecord = prevPersisted.combinatorStages[stageKey];
        const updatedStageAttempts = (prevRecord?.totalRunAttempts ?? 0) + 1;

        if (evalResult.status === 'STAGE CLEAR' && evalResult.score !== null) {
          const wasAlreadyCleared = prevRecord?.cleared === true;
          const runAttemptsBeforeFirstClear = wasAlreadyCleared
            ? (prevRecord.runAttemptsBeforeFirstClear ?? 1)
            : updatedStageAttempts;
          const bestScore =
            prevRecord?.bestScore !== null && prevRecord?.bestScore !== undefined
              ? Math.max(prevRecord.bestScore, evalResult.score)
              : evalResult.score;

          const isFirstEverClear = prevPersisted.firstEverClearedAtMs === null;
          if (isFirstEverClear) {
            clearedFirstEverInSessionRef.current = true;
          }

          const updatedRecord: CombinatorStageRecord = {
            stageId: stage.stageId,
            cleared: true,
            runAttemptsBeforeFirstClear,
            totalRunAttempts: updatedStageAttempts,
            bestScore,
          };

          const nextPersisted: PersistedArcadeStateV1 = {
            ...prevPersisted,
            firstEverClearedAtMs: isFirstEverClear
              ? finishNowMs
              : prevPersisted.firstEverClearedAtMs,
            combinatorTotalRuns: prevPersisted.combinatorTotalRuns + 1,
            combinatorStages: {
              ...prevPersisted.combinatorStages,
              [stageKey]: updatedRecord,
            },
          };

          commitPersisted(nextPersisted);
          boot.audio.triggerUserGestureCue('clear');
          boot.telemetry.emitStageCompleted({
            mode: 'combinator',
            stageId: stage.stageId,
            rankOrStatus: 'STAGE_CLEAR',
            attempts: updatedStageAttempts,
            isFirstEverClear,
            nowEpochMs: finishNowMs,
          });

          commitViewModel({
            ...liveVm,
            execution: {
              kind: 'cleared',
              slots: assignedTuple,
              stepIndex: 3,
              params: evalResult.finalParams,
              score: evalResult.score,
              maxShakeOffsetPx: shakeAmp,
            },
          });
          return;
        }

        const nonClearRecord: CombinatorStageRecord = {
          stageId: stage.stageId,
          cleared: prevRecord?.cleared === true,
          runAttemptsBeforeFirstClear:
            prevRecord?.cleared === true ? (prevRecord.runAttemptsBeforeFirstClear ?? 1) : null,
          totalRunAttempts: updatedStageAttempts,
          bestScore: prevRecord?.bestScore ?? null,
        };

        const isCrashed = evalResult.status === 'CRASHED';
        const nextPersisted: PersistedArcadeStateV1 = {
          ...prevPersisted,
          combinatorTotalRuns: prevPersisted.combinatorTotalRuns + 1,
          combinatorCrashedRuns: prevPersisted.combinatorCrashedRuns + (isCrashed ? 1 : 0),
          combinatorStages: {
            ...prevPersisted.combinatorStages,
            [stageKey]: nonClearRecord,
          },
        };

        commitPersisted(nextPersisted);
        boot.audio.triggerUserGestureCue('crash');

        if (isCrashed && evalResult.debugLog) {
          boot.telemetry.emitStageFailed({
            mode: 'combinator',
            stageId: stage.stageId,
            failureStep: evalResult.debugLog.location,
            failureReason: 'CRASHED',
            nowEpochMs: finishNowMs,
          });

          commitViewModel({
            ...liveVm,
            execution: {
              kind: 'crashed',
              slots: assignedTuple,
              stepIndex: evalResult.finalStepIndex,
              params: evalResult.finalParams,
              debugLog: evalResult.debugLog,
              maxShakeOffsetPx: shakeAmp,
            },
          });
          return;
        }

        if (evalResult.debugLog) {
          boot.telemetry.emitStageFailed({
            mode: 'combinator',
            stageId: stage.stageId,
            failureStep: 'FINAL CHECK',
            failureReason: 'FAILED',
            nowEpochMs: finishNowMs,
          });

          commitViewModel({
            ...liveVm,
            execution: {
              kind: 'failed',
              slots: assignedTuple,
              stepIndex: 3,
              params: evalResult.finalParams,
              debugLog: evalResult.debugLog,
              maxShakeOffsetPx: shakeAmp,
            },
          });
        }
      },
      Math.max(1, totalFrames) * stepDelayMs,
    );

    handles.push(finishHandle);
    simulationTimersRef.current = handles;
  };

  /* -------------------- Mode 2: Fermi Handlers -------------------- */

  const handleSelectFermiStage = (nextStageId: number): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'fermi' || currentVm.execution.kind === 'running') {
      return;
    }
    clearSimulationTimers();
    const stage = getFermiStage(nextStageId);
    const nextPath = `/fermi?stage=${String(stage.stageId)}`;
    if (`${window.location.pathname}${window.location.search}` !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }

    commitViewModel({
      screen: 'fermi',
      stageId: stage.stageId,
      stageFallbackNotice: false,
      execution: {
        kind: 'idle',
        selectedCardIds: [null, null, null],
      },
    });
    boot.telemetry.emitStageStarted('fermi', stage.stageId, Date.now());
  };

  const handleSelectFermiCard = (slotIndex: 0 | 1 | 2, cardId: string): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'fermi' || currentVm.execution.kind === 'running') {
      return;
    }
    clearSimulationTimers();
    const nextCards: [string | null, string | null, string | null] = [
      currentVm.execution.selectedCardIds[0],
      currentVm.execution.selectedCardIds[1],
      currentVm.execution.selectedCardIds[2],
    ];
    nextCards[slotIndex] = cardId;

    commitViewModel({
      ...currentVm,
      execution: {
        kind: 'idle',
        selectedCardIds: nextCards,
      },
    });
  };

  const handleFermiReset = (): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'fermi' || currentVm.execution.kind === 'running') {
      return;
    }
    clearSimulationTimers();
    commitViewModel({
      ...currentVm,
      execution: {
        kind: 'idle',
        selectedCardIds: [null, null, null],
      },
    });
  };

  const handleFermiFire = (): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'fermi' || currentVm.execution.kind === 'running') {
      return;
    }
    const [c0, c1, c2] = currentVm.execution.selectedCardIds;
    if (c0 === null || c1 === null || c2 === null) {
      return;
    }

    clearSimulationTimers();
    const stage = getFermiStage(currentVm.stageId);
    const selectedTuple: readonly [string, string, string] = [c0, c1, c2];
    const evalResult = evaluateFermiSelection(stage, selectedTuple);

    const reduced = isReducedMotionPreferred();
    const stepDelayMs = reduced ? 110 : 400;
    const shakeAmp = reduced ? 0 : 4;

    boot.audio.triggerUserGestureCue('fire');

    const nowEpochMs = Date.now();
    const nowPerfMs = window.performance.now();
    const returnCheck = evaluate7dReturnFlag(persistedRef.current, nowEpochMs);
    if (returnCheck.isReturn7d) {
      commitPersisted(returnCheck.nextState);
    }

    const nextAttemptNum =
      (persistedRef.current.fermiStages[String(stage.stageId)]?.totalFireAttempts ?? 0) + 1;

    boot.telemetry.emitSimulationExecuted({
      mode: 'fermi',
      stageId: stage.stageId,
      executionType: 'fire',
      attemptNumber: nextAttemptNum,
      isFirst7dReturnPlay: returnCheck.isReturn7d,
      nowPerfMs,
      nowEpochMs,
    });

    commitViewModel({
      ...currentVm,
      execution: {
        kind: 'running',
        selectedCardIds: selectedTuple,
        stepIndex: 1,
        currentShakeOffsetPx: shakeAmp,
        maxShakeOffsetPx: shakeAmp,
      },
    });

    const midHandle = window.setTimeout(() => {
      const liveVm = viewModelRef.current;
      if (liveVm.screen !== 'fermi' || liveVm.stageId !== stage.stageId) {
        return;
      }
      commitViewModel({
        ...liveVm,
        execution: {
          kind: 'running',
          selectedCardIds: selectedTuple,
          stepIndex: 2,
          currentShakeOffsetPx: -shakeAmp,
          maxShakeOffsetPx: shakeAmp,
        },
      });
    }, stepDelayMs);

    const finishHandle = window.setTimeout(() => {
      simulationTimersRef.current = [];
      const liveVm = viewModelRef.current;
      if (liveVm.screen !== 'fermi' || liveVm.stageId !== stage.stageId) {
        return;
      }

      const finishNowMs = Date.now();
      const prevPersisted = persistedRef.current;
      const stageKey = String(stage.stageId);
      const prevRecord = prevPersisted.fermiStages[stageKey];
      const updatedAttempts = (prevRecord?.totalFireAttempts ?? 0) + 1;

      const isClearJudgment =
        evalResult.judgment === 'PERFECT ORDER' || evalResult.judgment === 'GOOD RANGE';
      const nextCleared = prevRecord?.cleared === true || isClearJudgment;

      let nextBestJudgment: FermiBestJudgment | null = prevRecord?.bestJudgment ?? null;
      if (evalResult.judgment === 'PERFECT ORDER') {
        nextBestJudgment = 'PERFECT_ORDER';
      } else if (evalResult.judgment === 'GOOD RANGE' && nextBestJudgment !== 'PERFECT_ORDER') {
        nextBestJudgment = 'GOOD_RANGE';
      }

      const isFirstEverClear = isClearJudgment && prevPersisted.firstEverClearedAtMs === null;
      if (isFirstEverClear) {
        clearedFirstEverInSessionRef.current = true;
      }

      const updatedRecord: FermiStageRecord = {
        stageId: stage.stageId,
        cleared: nextCleared,
        bestJudgment: nextCleared ? nextBestJudgment : null,
        totalFireAttempts: updatedAttempts,
      };

      const nextPersisted: PersistedArcadeStateV1 = {
        ...prevPersisted,
        firstEverClearedAtMs: isFirstEverClear
          ? finishNowMs
          : prevPersisted.firstEverClearedAtMs,
        fermiTotalFires: prevPersisted.fermiTotalFires + 1,
        fermiTrapFires:
          prevPersisted.fermiTrapFires + (evalResult.trapTriggeredCount > 0 ? 1 : 0),
        fermiStages: {
          ...prevPersisted.fermiStages,
          [stageKey]: updatedRecord,
        },
      };

      commitPersisted(nextPersisted);

      if (isClearJudgment) {
        boot.audio.triggerUserGestureCue('perfect');
        boot.telemetry.emitStageCompleted({
          mode: 'fermi',
          stageId: stage.stageId,
          rankOrStatus:
            evalResult.judgment === 'PERFECT ORDER' ? 'PERFECT_ORDER' : 'GOOD_RANGE',
          attempts: updatedAttempts,
          isFirstEverClear,
          nowEpochMs: finishNowMs,
        });
      } else {
        boot.audio.triggerUserGestureCue('crash');
        boot.telemetry.emitStageFailed({
          mode: 'fermi',
          stageId: stage.stageId,
          failureStep: 'FERMI_EVAL',
          failureReason: evalResult.judgment === 'OVERKILL' ? 'OVERKILL' : 'UNDERESTIMATE',
          nowEpochMs: finishNowMs,
        });
      }

      commitViewModel({
        ...liveVm,
        execution: {
          kind: 'completed',
          selectedCardIds: selectedTuple,
          stepIndex: 3,
          judgment: evalResult.judgment,
          explanation: evalResult.explanation,
          maxShakeOffsetPx: shakeAmp,
        },
      });
    }, stepDelayMs * 3);

    simulationTimersRef.current = [midHandle, finishHandle];
  };

  /* -------------------- Screen 4: Diagnostic Copy Handler -------------------- */

  const handleCopySummary = (): void => {
    const currentVm = viewModelRef.current;
    if (currentVm.screen !== 'diagnostic') {
      return;
    }
    const profile = computeDiagnosticProfile(persistedRef.current);
    if (!profile.rankUnlocked || profile.overallScore === null) {
      return;
    }

    clearToastTimer();
    const summaryText = profile.shareSummaryText[persistedRef.current.locale];

    const showManualFallback = (): void => {
      const liveVm = viewModelRef.current;
      if (liveVm.screen !== 'diagnostic') {
        return;
      }
      const latestProfile = computeDiagnosticProfile(persistedRef.current);
      commitViewModel({
        screen: 'diagnostic',
        unlock: buildDiagnosticUnlock(latestProfile, {
          kind: 'manualFallback',
          manualText: summaryText,
        }),
      });
    };

    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== 'function'
    ) {
      showManualFallback();
      return;
    }

    try {
      const writePromise = navigator.clipboard.writeText(summaryText);
      writePromise.then(
        () => {
          const liveVm = viewModelRef.current;
          if (liveVm.screen !== 'diagnostic') {
            return;
          }
          const latestProfile = computeDiagnosticProfile(persistedRef.current);
          boot.telemetry.emitDiagnosticCopied(latestProfile.overallRank, Date.now());
          commitViewModel({
            screen: 'diagnostic',
            unlock: buildDiagnosticUnlock(latestProfile, {
              kind: 'copied',
              copiedText: summaryText,
            }),
          });

          toastTimerRef.current = window.setTimeout(() => {
            toastTimerRef.current = null;
            const afterVm = viewModelRef.current;
            if (afterVm.screen !== 'diagnostic') {
              return;
            }
            const afterProfile = computeDiagnosticProfile(persistedRef.current);
            commitViewModel({
              screen: 'diagnostic',
              unlock: buildDiagnosticUnlock(afterProfile, { kind: 'idle' }),
            });
          }, COPY_TOAST_DURATION_MS);
        },
        () => {
          showManualFallback();
        },
      );
    } catch {
      showManualFallback();
    }
  };

  const liveProfile = computeDiagnosticProfile(persisted);
  const storageStatus = boot.storage.getStatusSnapshot();

  return (
    <>
      <HeaderShell
        locale={persisted.locale}
        activeRoute={viewModel.screen}
        soundEnabled={persisted.soundEnabled}
        fallbackBannerVisible={storageStatus.fallbackBannerVisible}
        staleTabDetected={staleTabDetected}
        onNavigate={(href, ev) => navigateToHref(href, ev)}
        onToggleSound={handleToggleSound}
        onSelectLocale={handleSelectLocale}
      />

      <main id="main-content" className="site-main" tabIndex={-1}>
        <ErrorBoundary
          locale={persisted.locale}
          onRuntimeError={() => {
            boot.telemetry.emitClientError('runtime', activeRouteRef.current, Date.now());
          }}
        >
          {viewModel.screen === 'lobby' && (
            <LobbyScreen
              locale={persisted.locale}
              profile={liveProfile}
              phase={buildLobbyPhase(liveProfile)}
              onNavigate={(href, ev) => navigateToHref(href, ev)}
            />
          )}

          {viewModel.screen === 'combinator' && (
            <CombinatorScreen
              locale={persisted.locale}
              stageId={viewModel.stageId}
              stageFallbackNotice={viewModel.stageFallbackNotice}
              execution={viewModel.execution}
              stageRecords={persisted.combinatorStages}
              onSelectStage={handleSelectCombinatorStage}
              onToggleSlot={handleToggleCombinatorSlot}
              onClickModule={handleClickCombinatorModule}
              onRun={handleCombinatorRun}
              onStep={handleCombinatorStep}
              onReset={handleCombinatorReset}
              onNavigate={(href, ev) => navigateToHref(href, ev)}
            />
          )}

          {viewModel.screen === 'fermi' && (
            <FermiScreen
              locale={persisted.locale}
              stageId={viewModel.stageId}
              stageFallbackNotice={viewModel.stageFallbackNotice}
              execution={viewModel.execution}
              stageRecords={persisted.fermiStages}
              combinatorClearedCount={liveProfile.combinatorClearedCount}
              onSelectStage={handleSelectFermiStage}
              onToggleCard={handleSelectFermiCard}
              onFire={handleFermiFire}
              onReset={handleFermiReset}
              onNavigate={(href, ev) => navigateToHref(href, ev)}
            />
          )}

          {viewModel.screen === 'diagnostic' && (
            <DiagnosticScreen
              locale={persisted.locale}
              unlock={buildDiagnosticUnlock(
                liveProfile,
                viewModel.unlock.kind === 'unlocked' ? viewModel.unlock.share : { kind: 'idle' },
              )}
              onCopySummary={handleCopySummary}
              onNavigate={(href, ev) => navigateToHref(href, ev)}
            />
          )}

          {viewModel.screen === 'notFound' && (
            <NotFoundSection
              locale={persisted.locale}
              onNavigate={(href, ev) => navigateToHref(href, ev)}
            />
          )}
        </ErrorBoundary>
      </main>

      <footer className="site-footer">
        <p className="secondary-text">
          {`${t(persisted.locale, 'app.name')} — ${t(persisted.locale, 'app.subtitle')}`}
        </p>
      </footer>
    </>
  );
}
