import { NextRequest } from 'next/server'
import { preorderController } from '@/modules/preorders/preorder.controller'

export async function GET(request: NextRequest) {
  return preorderController.list(request)
}

export async function POST(request: NextRequest) {
  return preorderController.create(request)
}
