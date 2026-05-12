export interface OPWarning {
    level: 'info' | 'warning' | 'error'
    code: string
    record_type?: string | null
    record_id?: string | null
    message: string
    count?: number | null
}

export interface TaskState {
    key: string
    label: string
    status: 'pending' | 'running' | 'done' | 'error' | 'skipped'
    count?: number | null
    note?: string
}

export interface RunOptions {
    selectedModules: string[]
    rangeStart?: string
    rangeEnd?: string
}

export interface RunCallbacks {
    initTasks: (tasks: TaskState[]) => void
    updateTask: (key: string, patch: Partial<TaskState>) => void
    warning: (w: OPWarning) => void
}

export interface RunResult {
    json: string
    filename: string
}

export type ConverterFn = (
    token: string,
    userId: string,
    options: RunOptions,
    cb: RunCallbacks,
) => Promise<RunResult>

export interface Converter {
    sourceId: string
    destinationId: string
    run: ConverterFn
}

export function defineConverter(c: Converter): Converter {
    return c
}
