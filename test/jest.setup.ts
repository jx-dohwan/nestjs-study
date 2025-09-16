jest.mock('typeorm-transactional', () => ({
    __esModule: true,
    // 데코레이터를 그냥 원래 메서드 실행하도록
    Transactional: () => (_target: any, _key: string, desc: PropertyDescriptor) => desc,
    // 훅들도 바로 실행/무시
    runOnTransactionCommit: (cb: () => void) => cb && cb(),
    runOnTransactionRollback: (cb: () => void) => cb && cb(),
    runOnTransactionComplete: (cb: () => void) => cb && cb(),
    // 사용하지 않으면 안전한 no-op
    initializeTransactionalContext: () => {},
    addTransactionalDataSources: () => {},
  }));