import http from "k6/http";
import { sleep } from "k6";

let albums = [
  "revolver",
  "with the beatles",
  "teens of denial",
  "mellow gold",
  "No Dice",
  "Straight Up",
  "#1 Record",
  "Sincerely",
  "Cheap Trick",
  "Third/Sister Lovers",
  "20/20",
  "Disconnected",
  "Stands for Decibels",
  "The High and the Mighty",
  "Fortune 410",
  "Torn Apart",
  "Real Nighttime",
  "Songs from the Film",
  "Lolita Nation",
  "Something or Other",
  "Joyrides for Shut-Ins",
  "Serious Fun",
  "Horseshoes and Hand Grenades",
  "No More, No Less",
  "Cotton Is King",
  "20/20 / Look Out!",
  "1977",
  "Phantom Planet Is Missing",
  "Utopia Parkway",
  "Mock Heroic",
  "Bleed American",
  "Play with Your Head",
  "A Present for Everyone",
  "?",
  "Twin Cinema",
  "Rockford",
  "For Friends in Far Away Places",
  "Find Me a Drink Home",
  "All I Have to Offer Is My Own Confusion",
  "My Dinosaur Life",
  "Mikal Cronin",
  "Falling off the Sky",
  "Paramore",
  "Everything Will Be Alright in the End",
  "After Laughter",
];

export default function () {
  let album = albums[Math.floor(Math.random() * (albums.length - 1))];
  console.log(album);
  let response = http.get("http://127.0.0.1:3000/api/search?q=" + encodeURIComponent(album));
  console.log("ok? " + response.status);
  console.log(response.body);
  sleep(1);
}
