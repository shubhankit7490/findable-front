import { FirstWordPipe } from './firstWord.pipe';

describe('firstWord', () => {
	it('create an instance', () => {
		const pipe = new FirstWordPipe();
		expect(pipe).toBeTruthy();
	});
});
