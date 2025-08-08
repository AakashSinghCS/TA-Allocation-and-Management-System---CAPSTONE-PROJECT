import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import {
  showToastConfirmation,
  showToastSuccess,
  showToastError,
  showToastInfo
} from './toastConfirmation';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: vi.fn(),
}));

describe('toastConfirmation', () => {
  const mockToastId = 'mock-toast-id';
  const mockToast = vi.mocked(toast);
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockReturnValue(mockToastId);
    
    // Mock toast methods
    Object.assign(mockToast, {
      dismiss: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    });
  });

  describe('showToastConfirmation', () => {
    it('creates toast with default options', () => {
      const options = {
        title: 'Test Title',
        message: 'Test Message'
      };

      showToastConfirmation(options);

      expect(mockToast).toHaveBeenCalledWith(
        expect.any(Object),
        {
          position: "top-right",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          closeButton: false,
          className: "toast-confirmation",
        }
      );
    });

    it('handles all custom options and toast types', () => {
      const options = {
        title: 'Custom Title',
        message: 'Custom Message',
        confirmText: 'Yes',
        cancelText: 'No',
        type: 'danger' as const
      };

      const result = showToastConfirmation(options);

      expect(mockToast).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Promise);
    });

    it('supports all toast types (warning, danger, info)', () => {
      showToastConfirmation({ title: 'Warning', message: 'Msg', type: 'warning' });
      showToastConfirmation({ title: 'Danger', message: 'Msg', type: 'danger' });
      showToastConfirmation({ title: 'Info', message: 'Msg', type: 'info' });

      expect(mockToast).toHaveBeenCalledTimes(3);
    });
  });

  describe('showToastSuccess', () => {
    it('calls toast.success with default and custom autoClose', () => {
      showToastSuccess('Success message');
      showToastSuccess('Custom time', 5000);
      
      expect(mockToast.success).toHaveBeenCalledWith('Success message', { autoClose: 3000 });
      expect(mockToast.success).toHaveBeenCalledWith('Custom time', { autoClose: 5000 });
    });
  });

  describe('showToastError', () => {
    it('calls toast.error with default and custom autoClose', () => {
      showToastError('Error message');
      showToastError('Custom error', 6000);
      
      expect(mockToast.error).toHaveBeenCalledWith('Error message', { autoClose: 4000 });
      expect(mockToast.error).toHaveBeenCalledWith('Custom error', { autoClose: 6000 });
    });
  });

  describe('showToastInfo', () => {
    it('calls toast.info with default and custom autoClose', () => {
      showToastInfo('Info message');
      showToastInfo('Custom info', 2000);
      
      expect(mockToast.info).toHaveBeenCalledWith('Info message', { autoClose: 3000 });
      expect(mockToast.info).toHaveBeenCalledWith('Custom info', { autoClose: 2000 });
    });
  });

  describe('integration', () => {
    it('handles multiple toast types together', () => {
      showToastSuccess('Success!');
      showToastError('Error!');
      showToastInfo('Info!');
      
      expect(mockToast.success).toHaveBeenCalledWith('Success!', { autoClose: 3000 });
      expect(mockToast.error).toHaveBeenCalledWith('Error!', { autoClose: 4000 });
      expect(mockToast.info).toHaveBeenCalledWith('Info!', { autoClose: 3000 });
    });

    it('simulates button interactions for promise resolution', async () => {
      // Test cancel button behavior
      let resolveCancel: (value: boolean) => void;
      const cancelPromise = new Promise<boolean>((resolve) => {
        resolveCancel = resolve;
      });

      mockToast.mockImplementationOnce(() => {
        setTimeout(() => {
          resolveCancel!(false);
          (mockToast.dismiss as any)(mockToastId);
        }, 0);
        return mockToastId;
      });

      showToastConfirmation({ title: 'Test', message: 'Cancel test' });
      const cancelResult = await cancelPromise;
      
      expect(cancelResult).toBe(false);
      expect(mockToast.dismiss).toHaveBeenCalledWith(mockToastId);

      // Test confirm button behavior
      let resolveConfirm: (value: boolean) => void;
      const confirmPromise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });

      mockToast.mockImplementationOnce(() => {
        setTimeout(() => {
          resolveConfirm!(true);
          (mockToast.dismiss as any)(mockToastId);
        }, 0);
        return mockToastId;
      });

      showToastConfirmation({ title: 'Test', message: 'Confirm test' });
      const confirmResult = await confirmPromise;
      
      expect(confirmResult).toBe(true);
      expect(mockToast.dismiss).toHaveBeenCalledWith(mockToastId);
    });
  });
});
