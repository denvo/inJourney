/** Missile object */
(function() {
	// Private static members

	ij.registerClass('MissileObject', 'ShotObject', {
		TYPE: 'missile',
		ZORDER: 100,

		/** Dimension in grid units */
		WIDTH: 2,
		HEIGHT: 0.5,
		OFFSET: 1,

		/** Speed in grid units per millisecond */
		SPEED: 0.005,	

		MOVE_ANIMATION_ID: 'missile1',
		BLAST_ANIMATION_ID: 'blast1',

	});
})();
