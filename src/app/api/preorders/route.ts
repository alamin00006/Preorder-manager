import { NextRequest } from 'next/server'
import { preorderController } from '@/modules/preorders/preorder.controller'

export const GET = async (request: NextRequest) => {
  return preorderController.list(request)
}

export const POST = async (request: NextRequest) => {
  return preorderController.create(request)
}
