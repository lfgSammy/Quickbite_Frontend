import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the QuickBite navbar', () => {
  render(<App />);
  const brand = screen.getAllByText(/quickbite/i)[0];
  expect(brand).toBeInTheDocument();
});
