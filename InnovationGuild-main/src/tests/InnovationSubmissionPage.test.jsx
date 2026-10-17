import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import InnovationSubmissionPage from '../pages/common/InnovationSubmission/InnovationSubmissionPage';
import { BrowserRouter } from 'react-router';

// Mocks
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('../components/ui/FormSelect', () => ({
  default: ({ options, onChange, value, isMulti, placeholder, isDisabled }) => (
    <select 
      data-testid="form-select-mock" 
      disabled={isDisabled}
      multiple={isMulti}
      value={isMulti ? (value || []).map(v => v.value) : (value?.value || '')}
      onChange={(e) => {
        if (isMulti) {
          const selected = Array.from(e.target.selectedOptions).map(o => ({ value: o.value, label: o.text }));
          onChange(selected);
        } else {
          const opt = options.find(o => o.value === e.target.value);
          onChange(opt);
        }
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}));

vi.mock('../../../components/ui/FormSelectAndAdd', () => ({
  default: ({ options, onChange, value, isMulti, placeholder, isDisabled }) => (
    <select 
      data-testid="form-select-add-mock" 
      disabled={isDisabled}
      multiple={isMulti}
      onChange={(e) => {
        const values = Array.from(e.target.selectedOptions).map(o => o.value);
        onChange(values);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}));

// Mock child components to simplify testing the form logic
vi.mock('../pages/common/InnovationSubmission/_components/InnovationMediaUpload', () => ({
  default: ({ onMediaItemsChange, onOtherDocumentsChange, mediaItems }) => (
    <div data-testid="media-upload-mock">
      <button 
        type="button"
        onClick={() => onMediaItemsChange([{ type: 'file', fileType: 'image', file: new File([''], 'test.jpg', { type: 'image/jpeg' }), url: 'blob:test' }])}
      >
        Upload Mock Image
      </button>
      <div data-testid="media-count">{mediaItems.length}</div>
    </div>
  )
}));

vi.mock('../components/ui/PageHeader', () => ({
  default: ({ title }) => <h1>{title}</h1>
}));

// Helper to wrap component
const renderComponent = () => {
  return render(
    <BrowserRouter>
      <InnovationSubmissionPage />
    </BrowserRouter>
  );
};

describe('InnovationSubmissionPage Form Integration', () => {
  
  it('renders the form correctly', () => {
    renderComponent();
    expect(screen.getByText('Innovation Submission')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name of the Innovation/i)).toBeInTheDocument();
  });

  it('Scenario 1: Happy Path - Submits with valid data', async () => {
    renderComponent();
    const user = userEvent.setup();

    // 1. Basic Details
    await user.type(await screen.findByLabelText(/Name of the Innovation/i), 'Solar Dryer X1');
    await user.type(await screen.findByLabelText(/Year Launched/i), '2023');
    await user.type(await screen.findByLabelText(/Describe your Innovation/i), 'A high efficiency solar dryer for agricultural produce. Contains more than 20 chars.');
    
    // Select Category & Subcategory
    const selects = screen.getAllByTestId('form-select-mock');
    await user.selectOptions(selects[0], ['agriculture']); // Category
    await user.selectOptions(selects[1], ['processing']); // Subcategory
    await user.selectOptions(selects[2], ['poc']); // Stage
    await user.selectOptions(selects[3], ['KA']); // Location (Karnataka)

    // 2. Upload Media (Required)
    await user.click(await screen.findByText('Upload Mock Image'));
    expect(await screen.findByTestId('media-count')).toHaveTextContent('1');

    // 3. Fill Fields
    await user.type(await screen.findByLabelText(/Selling Price/i), '50000-60000');
    
    const allRadios = screen.getAllByRole('radio');
    // Distributor network Yes
    const distYes = allRadios.find(r => r.name === 'distributorNetwork' && r.value === 'yes');
    if (distYes) await user.click(distYes);

    // 4. Manufacturing
    await user.type(await screen.findByLabelText(/Where is the innovation manufactured/i), 'Bangalore, India');
    await user.click(screen.getByLabelText(/No imported parts/i)); 
    
    // spareParts Yes
    const sparePartsYes = allRadios.find(r => r.name === 'spareParts' && r.value === 'yes');
    if (sparePartsYes) await user.click(sparePartsYes);

    // 5. Technical Info
    const powerSourceRadio = allRadios.find(r => r.name === 'powerSource' && r.value === 'petrol_diesel');
    if (powerSourceRadio) await user.click(powerSourceRadio);
    await user.type(await screen.findByLabelText(/engine capacity/i), '150cc');

    await user.type(await screen.findByLabelText(/Dimensions/i), '2x2x2m');
    await user.type(await screen.findByLabelText(/Weight/i), '50kg');

    // Operations
    const addSelects = screen.getAllByTestId('form-select-add-mock');
    await user.selectOptions(addSelects[0], ['sowing']);

    // 6. Support Services (Radios)
    const maintenanceYes = allRadios.find(r => r.name === 'maintenanceTraining' && r.value === 'yes');
    if (maintenanceYes) await user.click(maintenanceYes);
    
    const financeYes = allRadios.find(r => r.name === 'financingSupport' && r.value === 'yes');
    if (financeYes) await user.click(financeYes);

    const techTrainingYes = allRadios.find(r => r.name === 'technicalTraining' && r.value === 'yes');
    if (techTrainingYes) await user.click(techTrainingYes);

    const demoYes = allRadios.find(r => r.name === 'demoInstallations' && r.value === 'yes');
    if (demoYes) await user.click(demoYes);

    // 7. Submit
    const submitBtn = await screen.findByRole('button', { name: /Submit Innovation/i });
    await user.click(submitBtn);

    // Verify
    await waitFor(() => {
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    });
  }, 20000);

  it('Scenario 2: Validation Errors - Shows errors on empty submit', async () => {
    renderComponent();
    const user = userEvent.setup();

    const submitBtn = screen.getByRole('button', { name: /Submit Innovation/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  it('Scenario 3: Conditional Logic - Power Source', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Select 'Petrol/Diesel'
    const allRadios = screen.getAllByRole('radio');
    const powerSourceRadio = allRadios.find(r => r.name === 'powerSource' && r.value === 'petrol_diesel');
    if (powerSourceRadio) await user.click(powerSourceRadio);

    // Expect 'Engine Capacity' field to appear
    expect(await screen.findByLabelText(/Engine capacity/i)).toBeInTheDocument();
  });

  it('Scenario 4: Numeric & Range Parsing', async () => {
    renderComponent();
    const user = userEvent.setup();

    const yearInput = screen.getByLabelText(/Year Launched/i);
    await user.type(yearInput, '2024');
    
    const priceInput = screen.getByLabelText(/Selling Price/i);
    await user.type(priceInput, '10000 - 20000'); 
    
    const submitBtn = await screen.findByRole('button', { name: /Submit Innovation/i });
    await user.click(submitBtn);

    await waitFor(() => {
       // Should not have "Must be a number" or price regex error
       expect(screen.queryByText(/Must be a number/i)).not.toBeInTheDocument();
       expect(screen.queryByText(/Enter a valid amount or range/i)).not.toBeInTheDocument();
    });
  });

});
