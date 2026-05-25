import { addReport, getAllReports } from './db';
import { useState, useEffect } from 'react';

// Hisobotni saqlash funksiyasi
const handleSave = async (data) => {
  await addReport(data);
  alert("Hisobot saqlandi!");
};

// Sahifa yuklanganda avvalgi hisobotlarni yuklash
useEffect(() => {
  const fetchReports = async () => {
    const savedReports = await getAllReports();
    setReports(savedReports);
  };
  fetchReports();
}, []);
