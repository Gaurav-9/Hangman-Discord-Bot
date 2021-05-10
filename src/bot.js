//require('dotenv').config( '../.env');
var game_status = false;

const DISCORDJS_BOT_TOKEN =
  "ODEwMzIwNzI2NDM5MzYyNTgy.YCh7_A.gsL9YaEWiqBQpm01lYFqYn-i-pk";
const PREFIX = "ms.";
const { Client } = require("discord.js");

const client = new Client();

client.on("ready", () => {
  console.log(client.user.tag, "is up and running");
});

client.on("message", function commands(message) {
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);
    if (CMD_NAME === "help") {
      message.reply(
        "Please write ms.hangman followed by the word you would like other players to guess"
      );
    }

    if (CMD_NAME === "hangman") {
      if (!args[0]) {
        message.reply("Please select a word sir");
      }
      if (game_status === false) {
        message.delete();
        hang_man(message, args[0]);
      } else if (game_status === true) {
        message.reply("A game is already running sir");
      }
    }
  }
});

client.login(DISCORDJS_BOT_TOKEN);

function hang_man(message, guess_word) {
  game_status = true;
  //VARIBLES USED//
  let guess_word_print = [];
  for (i = 0; i < guess_word.length; i++) {
    guess_word_print.push("_");
  }
  //console.log(guess_word_print);
  let guess_word_count = 0;

  let letters_guessed = [];

  var players = [];

  message.reply(
    "Your word has been recived, and we are ready to play! Type join if you would like to play, you have 30 seconds."
  );

  const filter = function if_join(m) {
    //GETTING ALL PLAYERS//
    var status = false;
    if (m.content === "join") {
      for (i = 0; i < players.length; i++) {
        if (m.author.tag === players[i]) {
          m.reply("You've already joined good sir");
          status = true;
        }
      }

      if (status === false) {
        players.push(m.author.tag);
        m.reply("Awesome, you're in");
        return true;
      }
    }
  };

  message.channel.awaitMessages(filter, { time: 30000 }).then(() => {
    if (players.length > 0) {
      //CHECKING IF PLAYERS SAID STUFF//

      message.channel.send(
        "The game has begun, guess letters in order to complete the word!"
      );

      guess_word = guess_word.toLowerCase(); // Convert to Lower Case Strings

      const filter_2 = function collect_guesses(mess) {
        if (game_status === true) {
          // CLEAR VARIABLES
          let author_confirm = undefined;
          let if_correct_guess = false;
          let letter_already_guessed = false;
          let num_of_wrong_guesses = 0;

          for (i = 0; i < players.length; i++) {
            if (mess.author.tag === players[i]) {
              author_confirm = true;
            }
          }

          if (author_confirm === true) {
            if (mess.content.toLowerCase() === guess_word.toLowerCase()) {
              mess.reply("Awesome you got the word!");
              game_status = false;
              players = [];
              letters_guessed = [];
              num_of_wrong_guesses = 0;
              game_status = false;
            }

            if (!/[^a-zA-Z]/.test(mess.content) && mess.content.length === 1) {
              //GAMECODE GOES HERE//
              for (i = 0; i < guess_word.length; i++) {
                if (mess.content === guess_word[i]) {
                  guess_word_print[i] = mess.content;
                  if_correct_guess = true;
                }
              }

              if (if_correct_guess === false) {
                //IF YOU GUESSED INCORRECTLY
                //console.log("Yes the path for incorrect guess is working");
                //CHECKING IF LETTER WAS ALREADY GUESSED
                for (i = 0; i < letters_guessed.length; i++) {
                  if (mess.content === letters_guessed[i]) {
                    letter_already_guessed = true;
                  }
                }
                //IF LETTER ALREADY GUESSED
                if (letter_already_guessed === true) {
                  message.channel.send("You've already said that letter");
                  letter_already_guessed = null;
                }
                //IF LETTER WASN"T GUESSED BUT STILL WRONG
                if (letter_already_guessed === false) {
                  num_of_wrong_guesses++;
                  letters_guessed.push(mess.content.toLowerCase());
                  mess.react("❌");

                  message.channel.send(
                    "`" + guess_word_print.join("").split("").join(" ") + "`"
                  ); // Print correct letters with spaces
                  letter_already_guessed = null;
                }

                if (letters_guessed.length > 0) {
                  //PRINT GUESSED LETTERS
                  message.channel.send(" Gussed Letters: ");
                  message.channel.send(letters_guessed.join(", "));
                }

                // if_correct_guess = undefined;
              }

              if (if_correct_guess === true) {
                //IF YOU GUSSED CORRECTLY
                //console.log("Yes the path for correct guess is working");
                //CHECK IF ALREADY GUSSED//
                for (i = 0; i < letters_guessed.length; i++) {
                  if (mess.content === letters_guessed[i]) {
                    letter_already_guessed = true;
                  }
                }
                //IF LETTER ALREADY GUESSED/;
                if (letter_already_guessed === true) {
                  message.channel.send("You've already said that letter");
                }
                //IF LETTER NOT ALREADY GUESSED //
                if (letter_already_guessed === false) {
                  letters_guessed.push(mess.content);
                  mess.react("✅");
                  message.channel.send(
                    "`" + guess_word_print.join("").split("").join(" ") + "`"
                  ); // Print correct letters with spaces
                  console.log(letters_guessed.length);

                  for (i = 0; i < guess_word.length; i++) {
                    if (mess.content === guess_word[i]) {
                      guess_word_count++;
                    }
                  }
                }
                //if_correct_guess = undefined;
              }

              if (num_of_wrong_guesses >= 10) {
                message.channel.send(
                  "You have used too many gueses I am sorry!"
                );
                message.channel.send("GAME OVER");
                game_status = false;
              }
            }

            //WHEN GAME IS FINISHED
            if (guess_word_count == guess_word.length) {
              // message.channel.send("`"+ guess_word_print.join("").split('').join(" ") + "`");
              message.channel.send(
                "Look at that you win! The word was " + guess_word
              );
              //CLEARING VARIABLES
              players = [];
              letters_guessed = [];
              num_of_wrong_guesses = 0;
              game_status = false;
            }
          } //END OF IF STATEMENT FOR GAME CODE
        } // END OF GAME STATUS
      }; //End of Filter

      message.channel.awaitMessages(filter_2, { time: 900000 });
    } else {
      message.channel.send(
        "That's unfournate, no one wants to play " +
          message.member.displayName +
          " :("
      );
    }
  });
} //END OF HANGMAN FUNCTION()
