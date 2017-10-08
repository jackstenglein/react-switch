import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { checkedIcon as defaultCheckedIcon, uncheckedIcon as defaultUncheckedIcon } from './icons';

class Switch extends Component {
  constructor(props) {
    super(props);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragStop = this.handleDragStop.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.state = {
      left: props.checked ? props.width - props.height + 1 : 1,
      startX: null,
      isDragging: false,
      hasOutline: false
    };
  }

  componentWillReceiveProps({ checked }) {
    const { width, height } = this.props;
    const checkedLeft = width - height + 1;
    const left = checked ? checkedLeft : 1;
    this.setState({ left });
  }

  handleDragStart(clientX) {
    this.setState({ startX: clientX, hasOutline: true });
  }

  handleDrag(clientX) {
    const { startX } = this.state;
    const { checked, width, height } = this.props;
    const checkedLeft = width - height + 1;

    const startLeft = checked ? checkedLeft : 1;
    const newLeft = startLeft + clientX - startX;
    const left = Math.min(checkedLeft, Math.max(1, newLeft));
    this.setState({ left, isDragging: true });
  }

  handleDragStop() {
    const { left, isDragging } = this.state;
    const { checked, onChange, width, height } = this.props;

    // Simulate clicking the handle
    if (!isDragging) {
      this.setState({ startX: null, hasOutline: false });
      onChange(!checked);
      return;
    }

    const checkedLeft = width - height + 1;
    if (checked) {
      if (left > (checkedLeft + 1) / 2) {
        this.setState({ left: checkedLeft, startX: null, isDragging: false, hasOutline: false });
        return;
      }
      this.setState({ startX: null, isDragging: false, hasOutline: false });
      onChange(false);
      return;
    }
    if (left < (checkedLeft + 1) / 2) {
      this.setState({ left: 1, startX: null, isDragging: false, hasOutline: false });
      return;
    }
    this.setState({ startX: null, isDragging: false, hasOutline: false });
    onChange(true);
  }

  handleMouseDown(event) {
    // Ignore right click and scroll
    if (typeof event.button === 'number' && event.button !== 0) { return; }

    this.handleDragStart(event.clientX);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove(event) {
    event.preventDefault();
    this.handleDrag(event.clientX);
  }

  handleMouseUp() {
    this.handleDragStop();
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  // TODO: Prevent mouse events from triggering on touch events.
  handleTouchStart(event) {
    this.handleDragStart(event.touches[0].clientX);
  }

  handleTouchMove(event) {
    this.handleDrag(event.touches[0].clientX);
  }

  handleTouchEnd(event) {
    event.preventDefault();
    this.handleDragStop();
  }

  handleTouchCancel() {
    this.setState({ startX: null, hasOutline: false });
  }

  handleClick() {
    const { checked, onChange } = this.props;
    onChange(!checked);
  }

  handleKeyDown(event) {
    const { checked, onChange } = this.props;
    const { isDragging } = this.state;
    // Trigger change on spacebar and enter keys (in violation of wai-aria spec).
    if ((event.keyCode === 32 || event.keyCode === 13) && !isDragging) {
      event.preventDefault();
      onChange(!checked);
    }
  }

  render() {
    const {
      checked,
      disabled,
      className,
      offColor,
      onColor,
      handleColor,
      activeHandleColor,
      checkedIcon,
      uncheckedIcon,
      boxShadow,
      height,
      width,
      id,
      'aria-labelledby': ariaLabelledby,
      'aria-label': ariaLabel
    } = this.props;
    const { left, isDragging, startX, hasOutline } = this.state;
    const checkedLeft = width - height + 1;

    const backgroundStyle = {
      height,
      width,
      background: offColor,
      borderRadius: height / 2,
      display: 'inline-block',
      position: 'relative',
      opacity: disabled ? 0.5 : 1,
      WebkitTransition: 'all 0.2s',
      MozTransition: 'all 0.2s',
      transition: 'all 0.2s',
      cursor: disabled ? 'default' : 'pointer'
    };

    const foregroundStyle = {
      height,
      width,
      opacity: (left - 1) / (checkedLeft - 1),
      background: onColor,
      WebkitTransition: isDragging ? null : 'opacity 0.2s ease-out',
      MozTransition: isDragging ? null : 'opacity 0.2s ease-out',
      transition: isDragging ? null : 'opacity 0.2s ease-out',
      borderRadius: height / 2
    };

    const handleStyle = {
      height: height - 2,
      width: height - 2,
      background: startX ? activeHandleColor : handleColor,
      touchAction: 'none',
      WebkitTransition: isDragging ? null : 'left 0.2s ease-out',
      MozTransition: isDragging ? null : 'left 0.2s ease-out',
      transition: isDragging ? null : 'left 0.2s ease-out',
      display: 'inline-block',
      borderRadius: '50%',
      position: 'absolute',
      left,
      top: 1,
      border: 0,
      outline: 0,
      boxShadow: hasOutline ? boxShadow : null
    };

    const uncheckedStyle = {
      position: 'absolute',
      right: 0,
      opacity: 1 - (left - 1) / (checkedLeft - 1),
      width: Math.min(height, width - height + 2),
      height,
      pointerEvents: 'none'
    };
    const checkedStyle = {
      width: Math.min(height, width - height + 2),
      height,
      pointerEvents: 'none'
    };

    return (
      <div
        className={className}
        style={backgroundStyle}
      >
        {uncheckedIcon ?
          (
            <div style={uncheckedStyle}>
              {uncheckedIcon}
            </div>
          ) : null
        }
        {/* eslint-disable jsx-a11y/no-static-element-interactions */ }
        <div
          className="react-switch-fg"
          style={foregroundStyle}
          onClick={disabled ? null : this.handleClick}
        >
          {checkedIcon ?
            (
              <div style={checkedStyle}>
                {checkedIcon}
              </div>
            ) : null
          }
        </div>
        {/* eslint-enable jsx-a11y/no-static-element-interactions */}
        <div
          role="checkbox"
          tabIndex={disabled ? null : 0}
          onMouseDown={disabled ? null : this.handleMouseDown}
          onTouchStart={disabled ? null : this.handleTouchStart}
          onTouchMove={disabled ? null : this.handleTouchMove}
          onTouchEnd={disabled ? null : this.handleTouchEnd}
          onTouchCancel={disabled ? null : this.handleTouchCancel}
          onKeyDown={this.handleKeyDown}
          onFocus={() => this.setState({ hasOutline: true })}
          onBlur={() => this.setState({ hasOutline: false })}
          onTransitionEnd={this.handleTransitionEnd}
          className="react-switch-handle"
          style={handleStyle}
          id={id}
          aria-checked={checked}
          aria-disabled={disabled}
          aria-labelledby={ariaLabelledby}
          aria-label={ariaLabel}
        />
      </div>
    );
  }
}

Switch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  offColor: PropTypes.string,
  onColor: PropTypes.string,
  handleColor: PropTypes.string,
  activeHandleColor: PropTypes.string,
  checkedIcon: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.element
  ]),
  uncheckedIcon: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.element
  ]),
  boxShadow: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  id: PropTypes.string,
  'aria-labelledby': PropTypes.string,
  'aria-label': PropTypes.string
};

Switch.defaultProps = {
  disabled: false,
  offColor: 'grey',
  onColor: 'green',
  handleColor: 'white',
  activeHandleColor: '#ddd',
  checkedIcon: defaultCheckedIcon,
  uncheckedIcon: defaultUncheckedIcon,
  boxShadow: '0px 0px 1px 2px #4D90FE',
  height: 28,
  width: 56,
  className: null,
  id: null,
  'aria-labelledby': null,
  'aria-label': null
};

export default Switch;
