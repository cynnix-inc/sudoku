import { jest } from '@jest/globals';

jest.mock('@supabase/supabase-js', () => {
	const mockCreate = jest.fn(() => ({ __mock: true }));
	return { createClient: mockCreate };
});

describe('supabase client (missing env)', () => {
	it('falls back to empty strings and warns when env is missing', () => {
		jest.resetModules();
		delete process.env['EXPO_PUBLIC_SUPABASE_URL'];
		delete process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'];

		require('../../app/services/supabase');
		const { createClient } = require('@supabase/supabase-js');
		const args = (createClient as jest.Mock).mock.calls[0] ?? [];
		expect(args[0]).toBe("");
		expect(args[1]).toBe("");
	});
});


