import { NextRequest } from 'next/server'
import { preorderController } from '@/modules/preorders/preorder.controller'

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return preorderController.get(_request, id)
}

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return preorderController.update(request, id)
}

export const DELETE = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  return preorderController.delete(_request, id)
}
