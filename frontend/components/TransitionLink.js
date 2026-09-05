import Link from 'next/link';
import { useRouter } from 'next/router';
import { navigateWithViewTransition } from '../lib/view-transitions';

export default function TransitionLink({ onClick, replace = false, ...props }) {
  const router = useRouter();
  function handleClick(event) {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateWithViewTransition(() => replace ? router.replace(props.href) : router.push(props.href));
  }
  return <Link {...props} onClick={handleClick} />;
}
