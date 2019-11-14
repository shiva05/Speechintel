export function setDataReducer(state: object ,  action) {
  switch (action.type) {
    case 'setUserName':
      return action.payload;
    default:
      return {'sd':'dhfjk'};
  }
}
