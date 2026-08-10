import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the QuickBite top bar', () => {
  render(<App />);
  const brand = screen.getByRole('link', { name: /quickbite/i });
  expect(brand).toBeInTheDocument();
});
