# llm-local-chat vs extension README

## Użycie
Instalowanie zależności
* npm install

Pobieranie wykorzystanego we wtyczce modelu
* npm run download-model

Uruchamianie wtyczki:
* ctrl + shift + p -> '>openllmwindow'


## TODO
Obecnie response odczytuję ze streama bardzo powolnie. Trzeba przyśpieszyć zwracanie odpowiedzi do użytkownika.
UI jest mało intuicyjny i zachęcający:
    * Odpowiedź modelu nie jest formatowana - wszystko wyświetlam jako plain text
        * warto obsłużyć chociażby formatowanie oznaczeń typu "``` javascript"
    * wygląd jest podstawowy, nie ma ciekawych elementów, a główne okno czatu ma niepotrzebne odstępy
