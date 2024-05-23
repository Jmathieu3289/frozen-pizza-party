import { useEffect, useState } from 'react';
import './App.css';
import { createClient } from  '@supabase/supabase-js';
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { Button, Stack, Form } from 'react-bootstrap';
import JSConfetti from 'js-confetti'

const PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0ZmhpeHF6eWFnYWJ1bmV3cWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4Mjc3NTEsImV4cCI6MjAzMTQwMzc1MX0.1FIRakbu5K2EnoPC-K5UhNbCpUxJoRNJ812o06tqqkk';
const supabase = createClient('https://ttfhixqzyagabunewqak.supabase.co', PUBLIC_KEY);

const fpPromise = FingerprintJS.load();

const queryParameters = new URLSearchParams(window.location.search);

const jsConfetti = new JSConfetti()

function App() {

  const [data, setData] = useState([]);
  const [visitorId, setVisitorId] = useState('');
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [thanks, setThanks] = useState(false);

  const [crust, setCrust] = useState(2.5);
  const [sauce, setSauce] = useState(2.5);
  const [toppings, setToppings] = useState(2.5);
  const [value, setValue] = useState(2.5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Get the visitor identifier when you need it.
      const fp = await fpPromise
      const result = await fp.get()
      setVisitorId(result.visitorId);

      // Get pizza data
      const { data } = await supabase.from('pizza').select();
      if (data) {
        setData(data);

        const pizza = data.find((d) => d.id.toString() === queryParameters.get('pizza'));
        setSelectedPizza(pizza);

        const thanks = queryParameters.get('thanks');
        if (thanks) {
          setThanks(thanks);
          jsConfetti.addConfetti({ emojis: ['🍕']});
        }
      }
    }
    fetchData();
  }, [])

  const submitPizzaRating = async () => {
    setSubmitting(true);
    await supabase.from('pizza_rating').insert({
      fingerprint: visitorId,
      crust: crust,
      sauce: sauce,
      toppings: toppings,
      value: value,
      overall: (parseFloat(crust) + parseFloat(sauce) + parseFloat(toppings) + parseFloat(value)) / 4,
      pizza_id: selectedPizza.id
    });
    window.location.href = '/?thanks=true'
  };

  return (
    <div className="text-center">
      { thanks && (
        <Stack className="vh-100  justify-content-center">
          <h1>Thanks for your rating!</h1>
        </Stack>
      )}
      { (!thanks && !selectedPizza) && (
        <>
          {
            data.map((d) => (
              <div key={d.id}>{d.id} - {d.brand} - {d.flavor} - ${d.price}</div>
            ))
          }
        </>
      )}
      { (!thanks && selectedPizza) && (
        <>
          <h1 className="mb-2 mt-2">{selectedPizza.brand} {selectedPizza.flavor}</h1>
          <Stack gap={5} className="mx-4 mt-5">
            <div>
              <h2>Crust - {crust}</h2>
              <Form.Range defaultValue={crust} min="0" max="5" step="0.25" onChange={(e) => setCrust(e.target.value)} />
            </div>
            <div>
              <h2>Sauce - {sauce}</h2>
              <Form.Range defaultValue={sauce} min="0" max="5" step="0.25" onChange={(e) => setSauce(e.target.value)} />
            </div>
            <div>
              <h2>Toppings - {toppings}</h2>
              <Form.Range defaultValue={toppings} min="0" max="5" step="0.25" onChange={(e) => setToppings(e.target.value)} />
            </div>
            <div>
              <h2>Value - {value}</h2>
              <Form.Range defaultValue={value} min="0" max="5" step="0.25" onChange={(e) => setValue(e.target.value)} />
            </div>
          </Stack>
          <Button variant="primary" size="lg" className="fixed-bottom m-1" onClick={submitPizzaRating} disabled={submitting}><h1 className="mb-1">Submit</h1></Button>
        </>
      )}
    </div>
  );
}

export default App;
