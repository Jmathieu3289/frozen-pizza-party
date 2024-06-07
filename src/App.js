/* eslint-disable jsx-a11y/no-distracting-elements */
/* eslint-disable jsx-a11y/alt-text */
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

  const [visitorId, setVisitorId] = useState('');
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [currentRating, setCurrentRating] = useState(null);
  const [thanks, setThanks] = useState(false);
  const [results, setResults] = useState(false);

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
        const pizza = data.find((d) => d.id.toString() === queryParameters.get('pizza'));
        setSelectedPizza(pizza);

        if (pizza) {
          const rating = (await supabase.from('pizza_rating').select().eq('fingerprint', result.visitorId).eq('pizza_id', pizza.id)).data;
          if (rating && rating.length > 0) {
            setCurrentRating(rating[0]);
            setCrust(parseFloat(rating[0].crust));
            setSauce(parseFloat(rating[0].sauce));
            setToppings(parseFloat(rating[0].toppings));
            setValue(parseFloat(rating[0].value));
          }
        }

        const results = queryParameters.get('results');
        if (results) {
          const resultsData = (await supabase.from('rating_results').select()).data;
          setResults(resultsData);
        }

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
    if (!currentRating) {
      await supabase.from('pizza_rating').insert({
        fingerprint: visitorId,
        crust: crust,
        sauce: sauce,
        toppings: toppings,
        value: value,
        overall: (parseFloat(crust) + parseFloat(sauce) + parseFloat(toppings) + parseFloat(value)) / 4,
        pizza_id: selectedPizza.id
      });
    } else {
      await supabase
      .from('pizza_rating').update({
        crust: parseFloat(crust),
        sauce: parseFloat(sauce),
        toppings: parseFloat(toppings),
        value: parseFloat(value),
        overall: (parseFloat(crust) + parseFloat(sauce) + parseFloat(toppings) + parseFloat(value)) / 4,
      })
      .eq('id', currentRating.id);
    }
    setCurrentRating(null);
    window.location.href = '/?thanks=true'
  };

  return (
    <div className="text-center">
      { thanks && (
        <Stack className="vh-100  justify-content-center">
          <h1>Thanks for your rating!</h1>
        </Stack>
      )}
      { results && (
        <Stack className="justify-content-center">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Pizza</th>
                <th>Crust</th>
                <th>Sauce</th>
                <th>Toppings</th>
                <th>Value</th>
                <th>Overall</th>
              </tr>
            </thead>
            <tbody>
              {
                results.map((result, i) => (
                  <tr>
                    <td>{i+1}</td>
                    <td>{result.brand} {result.flavor}</td>
                    <td>{result.average_crust}</td>
                    <td>{result.average_sauce}</td>
                    <td>{result.average_toppings}</td>
                    <td>{result.average_value}</td>
                    <td className="fw-bold">{result.average_overall}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </Stack>
      )}
      { (!thanks && !selectedPizza && !results) && (
        <div className="homepage">
          <div className="container">
            <header>
              <img src="https://i.gifer.com/4V4f.gif" width="100" height="100" />
              <h1 className="text-white">Frozen Pizza Showdown</h1>
              <img src="https://i.gifer.com/1NOR.gif" width="100" height="100" />
            </header>
            <main className="text-white" style={{ textAlign: "center"}}>
              <h2>Welcome to Kate and Justin's Frozen Pizza Showdown, where we find the best frozen pizza!</h2>
              <br></br>
              <h3>For the past six months, we have been tirelessly testing and ranking every frozen pizza we could get our hands on. Now, we invite you to sample our top ten pizzas (and bottom three pizzas) and together we can definitively determine the best frozen pizza!</h3>
              <br></br>
              <p className="fw-bold">There are four categories used for ranking: Crust, Sauce, Toppings, and Value. We use a scale of 1 to 5, with 1 being the worst and 5 being the best. Simply scan the QR code next to the pizza and give us your opinions!</p>
            </main>
          </div>
        </div>
      )}
      { (!thanks && selectedPizza) && (
        <>
          <h1 className="mb-2 mt-2">{selectedPizza.brand} {selectedPizza.flavor} { currentRating && "(Updating)"}</h1>
          <h2>${selectedPizza.price}</h2>
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
