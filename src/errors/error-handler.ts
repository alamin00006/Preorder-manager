import { NextResponse } from 'next/server'
import { isApiError } from './api-error'

export function handleApiError(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: error.status }
    )
  }

  console.error(error)

  return NextResponse.json(
    {
      success: false,
      message: 'Internal server error',
    },
    { status: 500 }
  )
}