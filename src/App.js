import React, { useState } from 'react';

function App() {
  const [trips, setTrips] = useState([]);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [metersDelivered, setMetersDelivered] = useState(0);
  const [loadTrailerMinutes, setLoadTrailerMinutes] = useState(0);
  const [loadTrailerDelayMinutes, setLoadTrailerDelayMinutes] = useState(0);
  const [ot1_5Checked, setOT1_5Checked] = useState(false);
  const [ot2Checked, setOT2Checked] = useState(false);
  const [startDayChecked, setStartDayChecked] = useState(false);
  const [pckTrlrChecked, setPckTrlrChecked] = useState(false);
  const [drpTrlrChecked, setDrpTrlrChecked] = useState(false);
  const [fuelTrkChecked, setFuelTrkChecked] = useState(false);
  const [fuelTrlrChecked, setFuelTrlrChecked] = useState(false);
  const [defChecked, setDefChecked] = useState(false);
  const [scaleChecked, setScaleChecked] = useState(false);
  const [endDayChecked, setEndDayChecked] = useState(false);

  const calculateTripCost = (distance) => {
    if (distance <= 160) {
      return 0.6418 * distance;
    } else if (distance <= 360) {
      return 0.6037 * distance;
    } else if (distance <= 1000) {
      return 0.5474 * distance;
    } else {
      return 0.4904 * distance;
    }
  };

  const calculateProductCost = (product) => {
    if (product === 'Argon') {
      return 0.004539;
    } else if (product === 'CO2') {
      return 0.003102;
    } else if (product === 'Oxygen' || product === 'Nitrogen') {
      return 0.003524;
    } else if (product === 'N2o') {
      return 0.003148;
    } else {
      return 0;
    }
  };

  const products = [
    ['Argon', 0.1],
    ['CO2', 0.2],
    ['Oxygen', 0.3],
    ['Nitrogen', 0.3],
    ['N2o', 0.3],
  ];

  const addTrip = () => {
    setTrips([...trips, { distance: 0, product: '', metersDelivered: 0 }]);
  };

  const updateTripDistance = (index, distance) => {
    const updatedTrips = [...trips];
    updatedTrips[index].distance = distance;
    setTrips(updatedTrips);
  };

  const updateTripProduct = (index, product) => {
    const updatedTrips = [...trips];
    updatedTrips[index].product = product;
    setTrips(updatedTrips);
  };

  const updateTripMetersDelivered = (index, metersDelivered) => {
    const updatedTrips = [...trips];
    updatedTrips[index].metersDelivered = metersDelivered;
    setTrips(updatedTrips);
  };

  const removeTrip = (index) => {
    const updatedTrips = [...trips];
    updatedTrips.splice(index, 1);
    setTrips(updatedTrips);
  };

  const calculateActivitiesCost = () => {
    let activitiesCost = 0;
    activitiesCost += ot1_5Checked ? activitiesCost * 0.5 : 0;
    activitiesCost += ot2Checked ? activitiesCost : 0;
    activitiesCost += pckTrlrChecked ? 0.1 : 0;
    activitiesCost += drpTrlrChecked ? 0.1 : 0;
    activitiesCost += fuelTrkChecked ? 0.1 : 0;
    activitiesCost += fuelTrlrChecked ? 0.1 : 0;
    activitiesCost += defChecked ? 0.1 : 0;
    activitiesCost += scaleChecked ? 0.1 : 0;
    activitiesCost += startDayChecked ? 22.73 : 0;
    activitiesCost += endDayChecked ? 0.1 : 0;

    if (ot1_5Checked) {
      activitiesCost *= 1.5;
    }

    if (ot2Checked) {
      activitiesCost *= 2;
    }

    return activitiesCost;
  };

  return (
    <div className="App">
      <div className="p-8">
        {/* Trip inputs */}
        {trips.map((trip, index) => (
          <div key={index} className="block my-2">
            <label className="mr-3">Trip {index + 1}</label>
            <input
              type="number"
              value={trip.distance}
              onChange={(e) => updateTripDistance(index, e.target.value)}
            />
            <label className="mr-3">Kilometers:</label>
            <select
              value={trip.product}
              onChange={(e) => updateTripProduct(index, e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((opt, productIndex) => (
                <option key={productIndex} value={opt[0]}>
                  {opt[0]}
                </option>
              ))}
            </select>
            <label className="mr-3">Meters:</label>
            <input
              type="number"
              value={trip.metersDelivered}
              onChange={(e) => updateTripMetersDelivered(index, e.target.value)}
            />
            <p>KM Cost: {(calculateTripCost(trip.distance)).toFixed(2)}</p>
            <p>Meters Cost: {(trip.metersDelivered * calculateProductCost(trip.product)).toFixed(2)}</p>
            <button onClick={() => removeTrip(index)}>Remove</button>
          </div>
        ))}

        {/* Add trip button */}
        <button onClick={addTrip}>Add Trip</button>

        {/* Delivery Count */}
        <div className="block my-4">
          <label className="mr-3">Delivery Count</label>
          <input
            name="deliveryCount"
            type="number"
            value={deliveryCount}
            onChange={(e) => setDeliveryCount(e.target.value)}
          />
        </div>

        {/* Load Trailer Count */}
        <div className="block my-4">
          <label className="mr-3">Load Trailer</label>
          <input
            type="number"
            value={loadTrailerMinutes}
            onChange={(e) => setLoadTrailerMinutes(e.target.value)}
          />
        </div>

        {/* Load Trailer Delay Over 60 Minutes */}
        <div className="block my-4">
          <label className="mr-3">Load Trailer Add (Minutes)</label>
          <input
            type="number"
            value={loadTrailerDelayMinutes}
            onChange={(e) => setLoadTrailerDelayMinutes(e.target.value)}
          />
        </div>

        {/* OT1.5 Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={ot1_5Checked}
              onChange={() => setOT1_5Checked(!ot1_5Checked)}
            />
            OT1.5
          </label>
        </div>

        {/* OT2 Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={ot2Checked}
              onChange={() => setOT2Checked(!ot2Checked)}
            />
            OT2
          </label>
        </div>

        {/* Start Day Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={startDayChecked}
              onChange={() => setStartDayChecked(!startDayChecked)}
            />
            Start Day
          </label>
        </div>

        {/* PckTrlr Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={pckTrlrChecked}
              onChange={() => setPckTrlrChecked(!pckTrlrChecked)}
            />
            PckTrlr
          </label>
        </div>

        {/* DrpTrlr Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={drpTrlrChecked}
              onChange={() => setDrpTrlrChecked(!drpTrlrChecked)}
            />
            DrpTrlr
          </label>
        </div>

        {/* Fuel Trk Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={fuelTrkChecked}
              onChange={() => setFuelTrkChecked(!fuelTrkChecked)}
            />
            Fuel Trk
          </label>
        </div>

        {/* Fuel Trlr Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={fuelTrlrChecked}
              onChange={() => setFuelTrlrChecked(!fuelTrlrChecked)}
            />
            Fuel Trlr
          </label>
        </div>

        {/* Def Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={defChecked}
              onChange={() => setDefChecked(!defChecked)}
            />
            Def
          </label>
        </div>

        {/* Scale Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={scaleChecked}
              onChange={() => setScaleChecked(!scaleChecked)}
            />
            Scale
          </label>
        </div>

        {/* End Day Checkbox */}
        <div className="block my-4">
          <label>
            <input
              type="checkbox"
              checked={endDayChecked}
              onChange={() => setEndDayChecked(!endDayChecked)}
            />
            End Day
          </label>
        </div>

        

        {/* Total cost */}
        <p>Total KM Cost: {trips.reduce((totalCost, trip) => totalCost + calculateTripCost(trip.distance), 0).toFixed(2)}</p>
        <p>Total Meters Cost: {trips.reduce((totalCost, trip) => totalCost + trip.metersDelivered * calculateProductCost(trip.product), 0).toFixed(2)}</p>
        <p>Activities Cost: {calculateActivitiesCost().toFixed(2)}</p>
        <p>Deliveries: {deliveryCount}</p>
      </div>
    </div>
  );
}

export default App;