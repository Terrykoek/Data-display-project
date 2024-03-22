import React, { useState } from 'react';
import './App.css';
import Chart from 'chart.js/auto';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true);
    setError(null);
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
  
      const contentType = response.headers.get('content-type');
  
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(data); // Log the data fetched from the server

        if (data.error) {
          throw new Error(data.error);
        }
  
        if (data.data) {

          const labels = data.data.map(item => item['0']); // Extract dates from each object
          const categories = data.data.map(item => item['1']); // Extract categories from each object
          const amounts = data.data.map(item => item['2']); // Extract amounts from each object

          const ctx = document.getElementById('myChart').getContext('2d');
  
          try {
            const chart = new Chart(ctx, {
              type: 'pie', // Change chart type to 'pie'
              data: {
                labels: labels.map((date, index) => `${date} (${categories[index]})`), // Combine dates and categories as labels
                datasets: [{
                  label: 'Amount',
                  data: amounts, // Use amounts as data
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                    // Add more colors as needed
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                    // Add more colors as needed
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true, // Makes the chart responsive to window resizing
                maintainAspectRatio: false, // Allows the chart to resize freely
                plugins: {
                  legend: {
                    position: 'bottom',
                    align: 'center', // Align the legend to the center
                    labels: {
                      color: 'white' // Set legend font color to white
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        // Display label as 'Date (Category): Amount'
                        return `${context.label}: ${context.formattedValue}`;
                      }
                    }
                  }
                }
              }
            });
            console.log(chart); // Log the initialized chart object
          } catch (error) {
            console.error('Error creating chart:', error.message); // Log any errors that occur during chart creation
          }
        }
      } else {
        const text = await response.text();
        throw new Error(text);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">Data display app</h1>
        <h2>Upload a CSV file contianing your financial data and watch them display into a chart!</h2>
        <h3>Step 1: Click choose file button to choose a csv file</h3>
        <h3>Step 2: Click upload button to generate chart</h3>
        <div className="upload-container">
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={!file || loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          {loading && <p>Loading...</p>}
          {error && <p className="error-message">Error: {error}</p>}
        </div>
      </div>
      <div className="chart-container">
          <canvas id="myChart" width="1000" height="1000"></canvas> {/* Add canvas element for the chart */}
      </div>
    </div>
  );
}

export default App;