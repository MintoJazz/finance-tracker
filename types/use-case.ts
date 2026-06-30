export type UseCaseSuccess<T> = {
    success: true
    data: T
}

export type UseCaseError = {
    success: false
    error: string
    issues?: Record<string, string[] | undefined>
}

export type UseCaseResponse<T> = UseCaseSuccess<T> | UseCaseError