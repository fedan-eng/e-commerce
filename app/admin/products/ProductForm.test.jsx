import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import ProductForm from './ProductForm';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('ProductForm AI description generation', () => {
  beforeEach(() => {
    push.mockReset();
  });

  it('replaces the description with an AI-generated version when the button is clicked', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ description: 'A polished SEO-friendly product description.' }),
    });
    global.fetch = fetchMock;

    const { container } = render(<ProductForm initial={{ name: 'MagFlex Power Bank', category: 'Accessories' }} />);

    const button = screen.getByRole('button', { name: /generate ai description/i });
    await user.click(button);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/products/generate-description',
        expect.objectContaining({ method: 'POST' })
      );
    });

    const textarea = container.querySelector('textarea');
    await waitFor(() => expect(textarea.value).toBe('A polished SEO-friendly product description.'));
  });
});
