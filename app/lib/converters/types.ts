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

/**
 * Everything a converter might need to reach its source. Token sources
 * (Simply Plural) use `token`/`userId`; file sources (Ampersand) use
 * `fileText`/`fileName`. A converter only reads the fields relevant to
 * its own `sourceId`.
 */
export interface SourceInput {
    token?: string
    userId?: string
    fileText?: string
    fileName?: string
}

export type ConverterFn = (
    input: SourceInput,
    options: RunOptions,
    cb: RunCallbacks,
) => Promise<RunResult>

export interface Converter {
    sourceId: string
    destinationId: string
    /**
     * Destination module keys this converter can actually populate. The UI
     * shows only these as toggles for the source. Undefined = every module
     * the destination declares.
     */
    modules?: string[]
    run: ConverterFn
}

export function defineConverter(c: Converter): Converter {
    return c
}
