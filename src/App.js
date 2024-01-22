import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    number: '',
  });
  const rowsPerPage = 10;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      const isCsvOrExcel = /\.(csv|xls|xlsx)$/i.test(fileName);

      if (isCsvOrExcel) {
        setFile(selectedFile);
        readAndDisplayFile(selectedFile);
      } else {
        alert('Please select a valid CSV, XLS, or XLSX file.');
        // Optionally, you can clear the file input
        event.target.value = null;
      }
    }
  };

  const readAndDisplayFile = (selectedFile) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target.result;
      const workbook = XLSX.read(result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setTableData(data.slice(1)); // Assuming the first row is the header
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleFilterChange = (e, column) => {
    const value = e.target.value.toLowerCase();
    setFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
  };

  // Define a constant header row
  const headerRow = ['name', 'email', 'number'];

  // Filter the data based on the current filters
  const filteredData = tableData.filter((row) =>
    Object.entries(filters).every(([key, value]) =>
      row[headerRow.indexOf(key)].toLowerCase().includes(value)
    )
  );

  // Calculate the range of rows to display for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  return (
    <div>
      <div className='upload'>
        <input type='file' onChange={handleFileChange} accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' />
      </div>
      {tableData.length >= 0 && (
        <div>
          {/* Filter inputs */}
          <div className='filters'>
            {headerRow.map((column, index) => (
              <input key={index} type='text' placeholder={`Filter ${column}`} value={filters[column]} onChange={(e) => handleFilterChange(e, column)} />
            ))}
          </div>

          <table>
            <thead>
              <tr>
                {headerRow.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(startIndex, endIndex).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className='page'>
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous Page
            </button>
            <span> Page {currentPage} </span>
            <button onClick={handleNextPage} disabled={endIndex >= filteredData.length}>
              Next Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
