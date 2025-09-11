import githubIcon from '../assets/github.svg';
import heartIcon from '../assets/heart.svg';
import eraserIcon from '../assets/eraser.svg';

export default function Footer({
  onEraserClick,
}: {
  onEraserClick: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="relative h-[1px] w-4/5 bg-black mask-r-from-20% mask-l-from-20%" />
      <div className="flex gap-4">
        <a
          href={'https://github.com/myssto/connections-clone'}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={githubIcon}
            alt={'Github repository link button'}
            title={'Github repository'}
            className="size-6"
          />
        </a>
        <a
          href={'https://buymeacoffee.com/myssto'}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={heartIcon}
            alt={'Donation link button'}
            title={'Support me'}
            className="size-6"
          />
        </a>
        <img
          src={eraserIcon}
          alt={'Clear puzzle completion progress button'}
          title={'Clear progress'}
          className="size-6 cursor-pointer"
          onClick={onEraserClick}
        />
      </div>
    </div>
  );
}
