import Notiflix from 'notiflix';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

class Notifier {
  //   constructor() {
  //     Notiflix.Notify.init({
  //       width: '80%',
  //       opacity: 1,
  //       fontSize: '16px',
  //       position: 'top',
  //       useIcon: false,
  //       borderRadius: '3px',
  //       fontFamily: 'Roboto Mono',
  //       info: {
  //         background: '#d7d7d7',
  //         textColor: '#333',
  //       },
  //     });
  //   }

  success(message) {
    Notify.success(message);
  }

  warning(message) {
    Notify.warning(message);
  }

  info(message) {
    Notify.info(message);
  }

  error(message) {
    Notify.failure(message);
  }
}

export default new Notifier();
