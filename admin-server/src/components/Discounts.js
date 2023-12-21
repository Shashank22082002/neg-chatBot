import React, { useState, useEffect } from 'react';
import './table.css';
import Navbar from './Navbar';

const DiscountRules = () => {

  const [discounts, setDiscounts] = useState([]);
  
  useEffect(() => {
    // Fetch discount rules data from the API
    fetch('http://localhost:3000/discount-rules')
      .then((response) => response.json())
      .then((data) => setDiscounts(data))
      .catch((error) => console.error('Error fetching discount rules:', error));
  }, []); // Empty dependency array to fetch data once on component mount

  const handleDiscountChange = async (day, slotNumber, peopleRange, newDiscount, index) => {
    try {
      const response = await fetch('http://localhost:3000/change-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rules: {
            day: day,
            slot_number: slotNumber,
            people_range: peopleRange,
            discount_val: newDiscount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update discount rules');
      }

      const updatedDiscounts = [...discounts];
      updatedDiscounts[index].Discount = newDiscount; // Update the discount in the local state

      setDiscounts(updatedDiscounts); // Update the state with the modified discounts array

      console.log('Discount rules updated:', updatedDiscounts);
      // Optionally, you can perform additional actions after a successful update
    } catch (error) {
      console.error('An error occurred while updating discount rules:', error);
      // Handle errors or display an error message to the user
    }
  };

  const findRange = (val) => {
    if (val <= 3) {
      // return a string val * 2 - 1, val * 2
      return `${val * 2 - 1} - ${val * 2}`;
    } else {
      return `6+`;
    }
  }

  const findSlot = (val) => {
    switch (val) {
      case 1:
        return "9:00 AM - 12:00 PM";
      case 2:
        return "12:00 PM - 3:00 PM";
      case 3:
        return "3:00 PM - 6:00 PM";
      case 4:
        return "6:00 PM - 9:00 PM";
      case 5:
        return "9:00 PM - 12:00 AM";
      default:
        return "Not Known";
    }
  }

  return (
    <div>
      <Navbar/>
      <table>
        <caption>Discount - Rules</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Slot Number</th>
            <th scope="col">People Range</th>
            <th scope="col">Discount Percentage</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((discount, index) => (
            <tr key={index}>
              <td data-label="Day">{discount.Day}</td>
              <td data-label="Slot Number">{findSlot(discount.SlotNumber)}</td>
              <td data-label="People Range">{findRange(discount.PeopleRange)}</td>
              <td data-label="Discount Percentage">
                <span>{discount.Discount}%</span>
                <button
                  onClick={() => {
                    const newDiscount = prompt('Enter new discount percentage:');
                    if (newDiscount !== null && !isNaN(newDiscount)) {
                      handleDiscountChange(discount.Day, discount.SlotNumber, discount.PeopleRange, newDiscount, index);
                      // also change value here
                    }

                  }}
                >
                  <i className='edit-square material-icons'>edit_square</i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountRules;