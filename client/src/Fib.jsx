import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function Fib() {
  const [index, setIndex] = useState('');
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});

  async function fetchValues() {
    const currentValues = await axios.get('/api/values/current');
    setValues(currentValues.data);
  }

  async function fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all');
    setSeenIndexes(seenIndexes.data);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await axios.post('/api/values', {
      index
    });

    setIndex('');
  }

  function renderValues() {
    const entries = [];

    for (let i in values) {
      entries.push(
        <div index={i}>
          For index {i} I calculated {values[i]}
        </div>
      )
    }

    return entries;
  }

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:
          <input type="text" value={index} onChange={event => setIndex(event.target.value)} />
        </label>
        <button type="submit">Submit</button>
      </form>

      <h3>Indexes I have seen:</h3>
      {seenIndexes.map(({ number }) => number).join(', ')}
      <h3>Calculated values:</h3>
      {renderValues()}
    </div>
  );
};
