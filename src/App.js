import { useEffect, useState } from 'react';
import './App.css';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0ZmhpeHF6eWFnYWJ1bmV3cWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4Mjc3NTEsImV4cCI6MjAzMTQwMzc1MX0.1FIRakbu5K2EnoPC-K5UhNbCpUxJoRNJ812o06tqqkk';

function App() {

  const supabase = createClient('https://ttfhixqzyagabunewqak.supabase.co', PUBLIC_KEY);

  const [data, setData] = useState({});

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('pizza').select();
      setData(data);
    }
    fetchData();
  }, [supabase])

  return (
    <div className="App">
      {data.map((d) => (
        <div key={d.id}>{d.brand} - {d.flavor} - ${d.price}</div>
      ))}
    </div>
  );
}

export default App;
