import { jest } from '@jest/globals';

jest.mock('@supabase/supabase-js', () => {
	const mockCreate = jest.fn(() => ({ __mock: true }));
	return { createClient: mockCreate };
});

describe('supabase client', () => {
	it('creates client with env vars', () => {
		process.env['EXPO_PUBLIC_SUPABASE_URL'] = 'https://example.supabase.co';
		process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] = 'anon-key';

		// Require after env is set to trigger createClient with values
		require('../../app/services/supabase');

		const { createClient } = require('@supabase/supabase-js');
		expect(createClient).toHaveBeenCalled();
		const args = (createClient as jest.Mock).mock.calls[0] ?? [];
		expect(args[0]).toBe('https://example.supabase.co');
		expect(args[1]).toBe('anon-key');
	});
});


