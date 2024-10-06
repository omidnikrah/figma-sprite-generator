import { Fragment } from "preact/compat";
import { CSSTransition, TransitionGroup } from "preact-transitioning";

interface ISelectingState {
  selectedIconsCount: number;
}

export const SelectingState = ({ selectedIconsCount }: ISelectingState) => {
  return (
    <Fragment>
      {!selectedIconsCount ? (
        <h2 className="px-7 text-center text-lg">Select the icons {"you'd"} like to include in your sprite.</h2>
      ) : (
        <h2 className="px-7 text-center text-lg">
          Selected Icons
          <br />
          <span className="relative flex h-9 w-full justify-center">
            <TransitionGroup>
              <CSSTransition key={selectedIconsCount} classNames="fade">
                <b className="absolute text-3xl font-semibold transition-all">{selectedIconsCount}</b>
              </CSSTransition>
            </TransitionGroup>
          </span>
        </h2>
      )}
    </Fragment>
  );
};
