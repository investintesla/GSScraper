
<img src="https://i.imgur.com/N5xx6EO.png" height="60" align="right"/>

## Spis treści
- [Wprowadzenie](#wprowadzenie)
- [Funkcje](#funkcje)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Użycie](#użycie)
- [Konfiguracja](#konfiguracja)
- [Autor](#autor)
- [Licencja](#licencja)

## Wprowadzenie

Projekt prostego web scrapera, który co `x sekund` sprawdza ofertę gorącego strzału na stronie x-kom'u, analizuje dostępne informacje o produkcie i zapisuje je w bazie danych MySQL.

## Funkcje

- Automatyczne pobieranie informacji o gorącym strzale,
- Analiza strony x-kom w poszukiwaniu informacji o produkcie,
- Zapisywanie informacji o produkcie w bazie danych MySQL.

## Wymagania

- Node.js
- Serwer SQL

## Użyte biblioteki


| ID  | Name      | Version     |
| --- | --------- | ----------- |
| 1.  | cheerio   | 1.0.0-rc.12 |
| 2.  | dotenv    | 16.3.1      |
| 3.  | express   | 4.18.2      |
| 4.  | mysql2    | 3.6.2       |
| 5.  | nodemon   | 3.01        |
| 6.  | puppeteer | 21.4.1      |
| 7.  | winston   | 3.11.0      |

## Instalacja

1. Sklonuj repozytorium na swoje urządzenie:
```
git clone https://github.com/investintesla/gsscraper.git
```

2. Przejdź do katalogu projektu:
```
cd gsscraper
```

3. Przeprowadź instalację modułów korzystajać z npm:
```
npm init -y
npm install
```

4. Skonfiguruj zmienne środowiskowe, tworząc plik `.env` w głównym katalogu projektu i uzupełnij go według przykładu z pliku `.env.example`.

## Użycie

1. Uruchom projekt:
```
npm start
```

2. Program co jakiś czas będzie sprawdzać stronę x-komu i aktualizować informacje o produkcie w bazie danych.

## Konfiguracja

W pliku `.env` znajdziesz zmienne środowiskowe, które można dostosować do swoich potrzeb. Oto przykładowa konfiguracja:
```
PORT=3000
INTERVAL=900

SQL_HOST=localhost
SQL_USER=root
SQL_PASSWORD=your_password
SQL_DATABASE=goracy_strzal_db
```

## Kontakt

Discord: palecrack2137 / E-mail: [kontakt@purpurmc.pl](mailto:kontakt@purpurmc.pl)

## Licencja

Ten projekt jest dostępny na licencji [GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/). Szczegółowe informacje znajdziesz w pliku LICENSE.
