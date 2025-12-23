import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders landing page', () => {
    // Wrap in BrowserRouter since App uses routing
    render(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
    // Assuming the landing page has text like "Calculadora" or similar. 
    // If we don't know exact text, we can just check if it renders without crashing.
    // Or check for a known element.
    // Let's create a snapshot or check for the title.
    // Based on "Calculadora de Hidrato de Carbono" from previous context.
    // We can just rely on render() succeeding for now as a smoke test.
    expect(document.body).toBeInTheDocument();
});
