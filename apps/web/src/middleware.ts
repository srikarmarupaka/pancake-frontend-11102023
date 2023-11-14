import { shouldGeoBlock } from '@pancakeswap/utils/geoBlock'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  if(req.nextUrl.pathname.includes('bsc-exchange')) {
    return NextResponse.rewrite(
        new URL(
            `${process.env.API_URL}${req.nextUrl.pathname}${req.nextUrl.search}`
        ),
        { request: req }
    );
  }

  if (shouldGeoBlock(req.geo)) {
    return NextResponse.redirect(new URL('/451', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/swap',
    '/liquidity',
    '/pools',
    '/farms',
    '/add',
    '/ifo',
    '/remove',
    '/prediction',
    '/find',
    '/limit-orders',
    '/lottery',
    '/nfts',
    '/info/:path*',
    '/bsc-exchange'
  ],
}
