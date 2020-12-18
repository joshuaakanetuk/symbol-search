import { useState, useEffect } from "react";
import "./App.css";
const ENDPOINT = "https://financialmodelingprep.com/api/v3/";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function App() {
  // states for the search query, 'current symbol
  // and search results
  let [search, setSearch] = useState();
  let [results, setResults] = useState([]);
  let [state, setState] = useState();

  // search for a symbol
  // search both nasdaq and nyse
  function submitSearch(search) {
    Promise.all([
      fetch(
        ENDPOINT +
          `/search?query=${search}&limit=5&exchange=NYSE&apikey=` +
          process.env.REACT_APP_API_KEY
      ).then((res) => {
        if(res["Error Message"]) return []
        return res.json()
      }),
      fetch(
        ENDPOINT +
          `/search?query=${search}&limit=5&exchange=NASDAQ&apikey=` +
          process.env.REACT_APP_API_KEY
      ).then((res) => {
        if(res["Error Message"]) return []
        return res.json()
      }),
    ])
      .then((res) => {
        return res[0].concat(res[1])
      })
      .then((data) => {
        if(data.length == 0) alert("Error searching for symbol!")
        setResults(data);
      })
      .catch((err) => err);
  }

  // after choosing a symbol, React sets 'current symbol'
  // on page with fetched info
  function chooseSymbol(sym) {
    fetch(ENDPOINT + `/profile/${sym.trim().toUpperCase()}?apikey=` + process.env.REACT_APP_API_KEY)
      .then((res) => res.json())
      .then((data) => {
        setState(data);
        setResults("");
      })
      .catch((err) => alert("Error getting symbol!"));
  }

  useEffect(() => {}, []);

  return (
    <div className="App">
      <div className="contain">
        <header>
          <div className="input-group">
            <input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Symbol of the company you want to lookup..."
              type="text"
            />
            <button onClick={() => submitSearch(search)}>Search</button>
          </div>
          <div className="results">
            {results && results.length > 0
              ? results.map((e, i) => (
                  <div className="result" key="i">
                    <span onClick={() => chooseSymbol(e.symbol)}>
                      {e.symbol} · {e.name}
                    </span>
                  </div>
                ))
              : ""}
          </div>
        </header>

        <div className="info">
          {state ? (
            <>
              <div className="symbol">{state[0].symbol}</div>
              <div className="price">
                ${state[0].price}
                {state[0].changes >= 0 ? (
                  <span className="pos"> +{state[0].changes}</span>
                ) : (
                  <span className="neg"> {state[0].changes}</span>
                )}
              </div>
              <div className="industry">
                <a href={state[0].website} target="_blank" rel="noreferrer">
                  {state[0].companyName}
                </a>{" "}
                · {state[0].industry}
              </div>
              <div className="exchange">
                {state[0].exchange} · {state[0].exchangeShortName}
              </div>
              <div className="description">{state[0].description}</div>
              <div className="more">
                <div className="flex">
                  <div className="cell">
                    <div>CEO</div>
                    <div>{state[0].ceo}</div>
                  </div>
                  <div className="cell">
                    <div>Employees</div>
                    <div>{numberWithCommas(state[0].fullTimeEmployees)}</div>
                  </div>
                  <div className="cell">
                    <div>Headquarters</div>
                    <div>
                      {state[0].city +
                        ", " +
                        state[0].state[0] +
                        state[0].state.slice(1).toLowerCase()}
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <div className="cell">
                    <div>Market Cap</div>
                    <div>{numberWithCommas(state[0].mktCap)}</div>
                  </div>
                  <div className="cell">
                    <div>Sector</div>
                    <div>{state[0].sector}</div>
                  </div>
                  <div className="cell">
                    <div>Volume Average</div>
                    <div>{numberWithCommas(state[0].volAvg)}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            `Search for a symbol!
            (Needs to be symbol like AAPL, not Apple Inc.)`
          )}
        </div>
      </div>
    </div>
  );
}
