// Taken from https://www.creative-tim.com/product/material-dashboard-react
import React from "react";
import classNames from "classnames";
// @material-ui/core components
import { withStyles } from "@material-ui/core/styles";
import { MenuItem, MenuList, Grow, Paper, ClickAwayListener, Hidden, Popper } from "@material-ui/core";
// @material-ui/icons
import { Person, Notifications, Search, ExitToApp } from "@material-ui/icons";
// core components
import CustomInput from "material-dashboard-react/dist/components/CustomInput/CustomInput.js";
import Button from "material-dashboard-react/dist/components/CustomButtons/Button.js";

import headerLinksStyle from "./headerLinksStyle.jsx";

class HeaderLinks extends React.Component {
  state = {
    open: false
  };

  // Placeholder function for clicking on a notification
  placeholderDoNothing = () => {
    console.log("test");
  }

  // Obtain notifications, then returns list of <MenuItem>s
  getNotifications = (dropdownClass) => {
    // TODO: obtain notifications dynamically
    const notifications = {
      "New notification 1": this.placeholderDoNothing,
      "New notification 2": this.placeholderDoNothing
    };

    const retVal = [];
    for (var key in notifications) {
      retVal.push(
        <MenuItem
          onClick={notifications[key]}
          className={dropdownClass}
          key={key}
        >
          {key}
        </MenuItem>
      );
    }
    return retVal;
  }

  // Event handler for clicking on the notifications
  toggleNotifications = () => {
    this.setState(state => ({ open: !state.open }));
  };

  // Event handler for clicking away from notifications while it is open
  closeNotifications = event => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }

    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;
    const { open } = this.state;
    const notifications = this.getNotifications(classes.dropdownItem);

    // When the screen is larger than "MdUp" size, we alter some menu items
    // so that they show up white in the sidebar (rather than black on the
    // main page)
    const expand = window.innerWidth >= this.props.theme.breakpoints.values.md;

    return (
      <div>
        {/* Searchbar */}
        <div className={classes.searchWrapper}>
          <CustomInput
            formControlProps={{
              className: classes.margin + " " + classes.search
            }}
            inputProps={{
              placeholder: "Search",
              inputProps: {
                "aria-label": "Search"
              }
            }}
          />
          <Button color="white" aria-label="edit" justIcon round>
            <Search />
          </Button>
        </div>

        {/* Notifications */}
        <div className={classes.manager}>
          <Button
            buttonRef={node => {
              this.anchorEl = node;
            }}
            color={expand ? "transparent" : "white"}
            justIcon={expand}
            simple={!(expand)}
            aria-owns={open ? "menu-list-grow" : null}
            aria-haspopup="true"
            onClick={this.toggleNotifications}
            className={classes.buttonLink}
          >
            <Notifications className={classes.icons} />
            <span className={classes.notifications}>{notifications.length}</span>
            <Hidden mdUp implementation="css">
              <p onClick={this.handleClick} className={classes.linkText}>
                Notifications
              </p>
            </Hidden>
          </Button>
          <Popper
            open={open}
            anchorEl={this.anchorEl}
            transition
            disablePortal
            className={
              classNames({ [classes.popperClose]: !open }) +
              " " +
              classes.popperNav
            }
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                id="menu-list-grow"
                style={{
                  transformOrigin:
                    placement === "bottom" ? "center top" : "center bottom"
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={this.closeNotifications}>
                    <MenuList role="menu">
                      {notifications}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>

        {/* Profile */}
        <Button
          color={expand ? "transparent" : "white"}
          justIcon={expand}
          simple={!(expand)}
          aria-label="Person"
          className={classes.buttonLink}
        >
          <Person className={classes.icons} />
          <Hidden mdUp implementation="css">
            <p className={classes.linkText}>Profile</p>
          </Hidden>
        </Button>

        {/* Log out */}
        <Button
          color={expand ? "transparent" : "white"}
          justIcon={expand}
          simple={!(expand)}
          aria-label="Log out"
          className={classes.buttonLink}
          href="/system/sling/logout"
          title="Log out"
        >
          <ExitToApp className={classes.icons} />
          <Hidden mdUp implementation="css">
            <p className={classes.linkText}>Log out</p>
          </Hidden>
        </Button>
      </div>
    );
  }
}

export default withStyles(headerLinksStyle, {withTheme: true})(HeaderLinks);
