import { directive } from "./directive.js";
import { WritableSignal } from "./signal.js";
import { Template } from "./Template.js";

/**
 * Sets up a two-way binding between a writable boolean signal and an audio or video element.
 * When the signal is true it attempts to play the attached media; when false it pauses it.
 * The signal is updated when the media fires play/pause events so the UI and player stay in sync.
 * @example
 * function MediaBinding() {
 * 	const playing = signal(false);
 * 
 * 	return [
 * 		Video(
 * 			bindPlaying(playing),
 * 			{
 * 				controls: true,
 * 				src: "./my-video.webm"
 * 			}
 * 		),
 * 		Br(),
 * 		Button(() => playing() ? "Pause" : "Play", {
 * 			onclick: () => playing.set(!playing.get())
 * 		})
 * 	];
 * }
 * 
 * @param isPlaying Tells whether the media element is playing.
 * @returns A template that can be used in an audio or video element to create a binding.
 */
export function bindPlaying(isPlaying: WritableSignal<boolean>): Template<HTMLMediaElement> {
	function reset(): void {
		isPlaying.set(false);
	}

	return [
		directive(function(element) {
			if (isPlaying()) {
				if (element.paused) {
					var playPromise = element.play();

					if (playPromise) {
						playPromise.then(null, reset);
					}
				}
			} else {
				if (!element.paused) {
					element.pause();
				}
			}
		}),
		{
			onpause: reset,
			onplay: function() {
				isPlaying.set(true);
			}
		}
	];
}
