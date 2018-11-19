/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const tmdb = require('./lib/tmdb');

function getIntro() {
  // Helper function to get a random intro phrase
  const introPhrases = [
    'A great movie is ',
    'I think you would really like ',
    'Have you seen ',
    'You will definitely like ',
    'Oh, you will probably enjoy '
  ]

  let random = Math.floor(Math.random() * introPhrases.length);
  return introPhrases[random];
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Hello! I can recommend movies based on your taste.';
    const repromptText = 'To start, you can say recommend me a movie with Leonardo DiCaprio or suggest me a movie from 2017'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .withSimpleCard('Welcome!', speechText)
      .getResponse();
  },
};

/** Handler for movie recommendations.**/
const RecommendMovieIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RecommendMovieIntent';
  },
  async handle(handlerInput) {

    let actorOne = handlerInput.requestEnvelope.request.intent.slots.ActorOne.value;
    let actorTwo = handlerInput.requestEnvelope.request.intent.slots.ActorTwo.value;
    let director = handlerInput.requestEnvelope.request.intent.slots.Director.value;
    let year = handlerInput.requestEnvelope.request.intent.slots.ReleaseYear.value;

    // People use the same API, group them.
    var people = [];
    if (actorOne) { people.push(actorOne) }
    if (actorTwo) { people.push(actorTwo) }
    if (director) { people.push(director) }

    var speechText = '';
    let movie = await tmdb.searchMovie(people, year);

    if (movie) {
      speechText = getIntro() + movie;
    } else {
      speechText = `I couldn't think of any movie you would like.`
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Movie', speechText)
      .getResponse();

  }
};

/** Handler for movie comparissons **/
const SimilarMovieIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'SimilarMovieIntent';
  },
  async handle(handlerInput) {

    if (handlerInput.requestEnvelope.request.dialogState != 'COMPLETED') {
      return handlerInput.responseBuilder
        .addDelegateDirective()
        .getResponse();
    } else {

      var speechText = '';
      var movie = handlerInput.requestEnvelope.request.intent.slots.Movie.value;

      let similar = await tmdb.findSimilar(movie);

      if (similar) {
        speechText = getIntro() + similar;
      }
      else { speechText = `I couldn't think of any movie you would like.` }

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Movie', speechText)
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'I can give movie suggestions for your favorite actors, directors and genres.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Help', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Farewell', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RecommendMovieIntentHandler,
    SimilarMovieIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
