import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export default async function (request) {
  let data = await getToken({ req: request, secret: process.env.JWT_SECRET });

  const accesspath = [{
    label: "dashboard",
    path: "/admin/dashboard",
  },
  {
    label: "leave",
    path: "/admin/leaves",
  },
  {
    label: "employees",
    path: "/admin/employees",
  },
  {
    label: "setting",
    path: "/admin/setting",
  }, {
    label: "Leave Balance",
    path: "/admin/leavebalance",
  }
  ]
  const access = accesspath.filter(menu => {
    return data?.accessModules?.some(data => data.module === menu.label)
  })
  const accepath = access.map(data => data.path)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (data) {
      if (data.role === "admin") {
        return NextResponse.next()
      } else {
        if (accepath.includes(request.nextUrl.pathname)) {
          return NextResponse.next()
        }
        let url = request.nextUrl;
        return NextResponse.redirect(`${url.origin}/auth/SignIn`);
      }
    } else {
      let url = request.nextUrl;
      return NextResponse.redirect(`${url.origin}/auth/SignIn`);
    }
  } else {
    NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!auth|images|api|_next/static|_next/image|favicon.ico).*)'],
}