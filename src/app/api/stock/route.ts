import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'src', 'data', 'stock.json')

export async function GET() {
  try { return NextResponse.json(JSON.parse(fs.readFileSync(FILE, 'utf-8'))) }
  catch { return NextResponse.json({}) }
}
