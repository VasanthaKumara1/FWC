import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(r => r.json())

export default function Home() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const { data: health } = useSWR(`${apiBase}/health`, fetcher)
  const { data: employees } = useSWR(`${apiBase}/employees`, fetcher)

  return (
    <div style={{padding: 24,fontFamily: 'Arial'}}>
      <h1>FWC HRMS — Demo Frontend</h1>
      <p>Backend status: {health ? health.status : 'loading...'}</p>
      <h2>Employees</h2>
      {employees ? (
        <ul>
          {employees.map(e => (
            <li key={e._id}>{e.firstName} {e.lastName} — ${e.salary}</li>
          ))}
        </ul>
      ) : <p>Loading...</p>}
    </div>
  )
}
