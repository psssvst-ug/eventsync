import { useRouter } from 'next/router'
 
export default function Page() {
  const router = useRouter()
  return <p>Payment Id: {router.query.id}</p>
}