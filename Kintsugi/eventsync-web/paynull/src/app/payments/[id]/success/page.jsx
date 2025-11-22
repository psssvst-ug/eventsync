"use client"

import { useRouter } from "next/navigation"

 
export default function Page() {
  const router = useRouter()
  return <p>Payment Id: {router.query.id}</p>
}