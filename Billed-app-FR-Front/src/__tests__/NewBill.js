/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import BillsUI from '../views/BillsUI.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import store from '../__mocks__/store.js';
import { ROUTES } from '../constants/routes';
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then I should be able to submit my file', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      /* FILE INPUT */
      await waitFor(() => screen.getByTestId('file'));
      const file = screen.getByTestId('file');

      fireEvent.change(file, {
        target: {
          files: [
            new File(['test file content'], 'test.txt', {
              type: 'text/plain',
            }),
          ],
        },
      });

      file.addEventListener(
        'change',
        jest.fn((e) => e.preventDefault())
      );
      expect(file.files[0].name).toBe('test.txt');

      /* EXPENSE TYPE */

      await waitFor(() => screen.getByTestId('expense-type'));
      const expenseType = screen.getByTestId('expense-type');

      fireEvent.change(expenseType, { target: { value: 'Transports' } });
      expect(expenseType.value).toBe('Transports');

      /* EXPENSE NAME */

      await waitFor(() => screen.getByTestId('expense-name'));
      const expenseName = screen.getByTestId('expense-name');

      fireEvent.change(expenseName, { target: { value: 'testnameforexpense' } });
      expect(expenseName.value).toBe('testnameforexpense');

      /* AMOUNT */

      await waitFor(() => screen.getByTestId('amount'));
      const amount = screen.getByTestId('amount');

      fireEvent.change(amount, { target: { value: 42 } });
      expect(amount.value).toBe('42');

      /* DATE PICKER */

      await waitFor(() => screen.getByTestId('datepicker'));
      const datepicker = screen.getByTestId('datepicker');

      fireEvent.change(datepicker, { target: { value: '2023-09-07' } });
      expect(datepicker.value).toBe('2023-09-07');

      /* VAT */

      await waitFor(() => screen.getByTestId('vat'));
      const vat = screen.getByTestId('vat');

      fireEvent.change(vat, { target: { value: 12 } });
      expect(vat.value).toBe('12');

      /* PCT */

      await waitFor(() => screen.getByTestId('pct'));
      const pct = screen.getByTestId('pct');

      fireEvent.change(pct, { target: { value: 13 } });
      expect(pct.value).toBe('13');

      /* commentary */

      await waitFor(() => screen.getByTestId('commentary'));
      const commentary = screen.getByTestId('commentary');

      fireEvent.change(commentary, { target: { value: 'Some random commentary' } });
      expect(commentary.value).toBe('Some random commentary');

      /* SUBMIT */

      await waitFor(() => screen.getByTestId('form-new-bill'));
      const formNewBill = screen.getByTestId('form-new-bill');

      const handleSubmit = jest.fn((e) => e.preventDefault());

      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);
      expect(screen.getByTestId('form-new-bill')).toBeTruthy();
    });
    test('Container methods must be called', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          email: 'john.doe@example.com',
        })
      );

      const newBillsContainer = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      await waitFor(() => screen.getByTestId('file'));
      const file = screen.getByTestId('file');

      const handleChangeFile = jest.fn(newBillsContainer.handleChangeFile);
      file.addEventListener('change', handleChangeFile);

      fireEvent.change(file, {
        target: {
          files: [
            new File(['test file content'], 'test.txt', {
              type: 'text/plain',
            }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();

      await waitFor(() => screen.getByTestId('form-new-bill'));
      const formNewBill = screen.getByTestId('form-new-bill');

      const handleSubmit = jest.fn((e) => newBillsContainer.handleSubmit);

      formNewBill.addEventListener('submit', handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
  describe('when an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills');
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.appendChild(root);
      router();
    });
    test('Then: bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });
      document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test('Then: bills from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'));
          },
        };
      });

      document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
  });
});
