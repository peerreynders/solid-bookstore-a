import { Link } from 'solid-app-router';
import logo from '../assets/logo.svg';

function Nav() {
  return (
    <header>
      <div class="shell-header">
        <a href="https://www.solidjs.com/" target="_blank" rel="noreferrer">
          <img src={logo} class="shell-logo" alt="logo" />
        </a>
        <h2>Welcome to the SolidJS Book shop!</h2>
      </div>
      <nav class="shell-menu">
        <Link href="/books" class="shell-menu__item">
          Available books
        </Link>
        <Link href="/cart" class="shell-menu__item">
          Your Cart
        </Link>
      </nav>
    </header>
  );
  /*
     <header class="header">
     <nav class="inner">
     <Link href="/top">
     <strong>HN</strong>
     </Link>
     <Link href="/new">
     <strong>New</strong>
     </Link>
     <Link href="/show">
     <strong>Show</strong>
     </Link>
     <Link href="/ask">
     <strong>Ask</strong>
     </Link>
     <Link href="/job">
     <strong>Jobs</strong>
     </Link>
     <a
     class="github"
     href="http://github.com/solidjs/solid"
     target="_blank"
     rel="noreferrer"
     >
     Built with Solid
     </a>
     </nav>
     </header>
   */
}

export { Nav };
