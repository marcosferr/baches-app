import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { PostalPDF } from './postal-pdf';

export async function createPostalPDF(
  name: string,
  reports: any[],
  date: Date = new Date()
): Promise<Buffer> {
  return await renderToBuffer(
    React.createElement(PostalPDF, {
      name,
      reports,
      date
    })
  );
}
