import React, { Component } from "react";
import DeconetPaymentsSplittingFactory from "./contracts/DeconetPaymentsSplittingFactory.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";

import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import TableFooter from '@material-ui/core/TableFooter';

import { lighten } from '@material-ui/core/styles/colorManipulator';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { withStyles } from '@material-ui/core/styles';

import classNames from 'classnames';

import "./App.css";

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
    maxWidth: 1024,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  table: {
    minWidth: 700,
  },
  button: {
    marginTop: 50
  },
  input: {
    // margin: theme.spacing.unit,
  },
  inputSlider: {

  },
  inputAdornment: {
    width: 50
  },
  spacer: {
    flex: '1 1 100%',
  },
  newContractAddress: {
    width: 400
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  tableTitle: {
    flex: '0 0 auto',
  },
  tableToolbarHighlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  toolbarRoot: {
    paddingRight: theme.spacing.unit,
  },
});

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    loaded: false,
    newContractAddress: null,
    distributions: [
      {
        address: '',
        percentage: 0,
        selected: false
      },
      {
        address: '',
        percentage: 0,
        selected: false
      }
    ]
  };

  async componentDidMount() {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const Contract = truffleContract(DeconetPaymentsSplittingFactory);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      // console.log(instance)

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, loaded: true });

       // refresh if network or account changes
      setInterval(this.checkIfMetamaskChanged.bind(this), 500)
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  checkIfMetamaskChanged(){
    this.state.web3.eth.getAccounts().then((accts) => {
      if (accts[0] !== this.state.accounts[0]) {
        this.setState({accounts: accts})
      }
    })
  }

  deploy() {
    if (this.totalPercentages() !== 100) {
      alert('The sum of all percentages should equal exactly 100%.  Please adjust your percentages until the sum is 100%');
      return;
    }
    const { distributions } = this.state;
    const destinations = distributions.map(d => d.address)
    if (destinations.filter(d => d.length !== 42).length) {
      alert('Please enter addresses for every row')
      return
    }
    console.log(destinations)
    console.log('deploying')
    const percentages = distributions.map(d => d.percentage)
    console.log(percentages)
    // const destinations = ['0xb962537314b11c6bcd6d9ff63feb048a9e91e7ae', '0xa2266e01703e4ca0ffc4b374635acdbdabda7793']
    // const percentages = [90,10]
    this.state.contract.createPaymentsSplitting(destinations, percentages, 0, { from: this.state.accounts[0]})
    .then(receipt => {
      console.log(receipt)
      const { logs } = receipt;
      const newContractAddress = logs[0].args.newCloneAddress;
      this.setState({newContractAddress})
    })
  }

  // handlePercentageChange(idx, event){
  //   let val = event.target.value
  //   this.setState(prevState => {
  //     let { distributions } = prevState;
  //     let diff = 100 - val;
  //     let divisor = distributions.length - 1;
  //     let toSet = diff / divisor;
  //     if (divisor > 0) {
  //       distributions.forEach((d, dIdx) => {
  //         if (dIdx !== idx) {
  //           d.percentage = toSet
  //           // if (d.percentage < 0) {
  //           //   d.percentage = 0;
  //           // } else if (d.percentage > 100) {
  //           //   d.percentage = 100;
  //           // }
  //         }
  //       })
  //     }
  //     distributions[idx].percentage = val;
  //     return {
  //       distributions
  //     }
  //   })
  // }

  handleChange(idx, field, event) {
    let val = event.target.value
    if (field === 'selected') {
      val = !this.state.distributions[idx][field]
    }
    this.setState(prevState => {
      let { distributions } = prevState;
      distributions[idx][field] = val;
      return {
        distributions
      }
    })
  }

  addDistribution(){
    this.setState(prevState => {
      return {
        distributions: [...prevState.distributions, {address: '', percentage: 0, selected: false}]
      }
    })
  }

  deleteSelected(){
    this.setState(prevState => {
      let { distributions } = prevState;
      return {
        distributions: distributions.filter(d => !d.selected)
      }
    })
  }

  selectedDistributions(){
    return this.state.distributions.filter(d => d.selected)
  }

  totalPercentages(){
    return this.state.distributions.map(d => d.percentage).reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue))
  }

  copyNewContractAddress(){
    /* Get the text field */
    var copyText = document.getElementById("newContractAddress");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy")
  }

  renderTable() {
    const { distributions } = this.state;
    const { classes } = this.props;
    const numSelected = this.selectedDistributions().length;
    const totalPercentages = this.totalPercentages();
    // console.log(totalPercentages);
    let sumColor = 'rgba(0, 0, 0, 0.54)';
    if (totalPercentages === 100) {
      sumColor = 'rgba(53, 153, 53, 1)'
    } else if (totalPercentages > 100) {
      sumColor = 'rgba(255, 100, 100, 0.70)'
    }

    return (
      <Paper className={classes.root}>
        <Toolbar className={classNames(classes.toolbarRoot, {
          [classes.tableToolbarHighlight]: numSelected > 0,
        })}>
          <div className={classes.tableTitle}>
            {numSelected > 0 ? (
              <Typography color="inherit" variant="subheading">
                {numSelected} selected
              </Typography>
            ) : (
              <Typography variant="title" id="tableTitle">
                Receivers
              </Typography>
            )}
          </div>
          <div className={classes.spacer} />
          <div className={classes.actions}>
            {numSelected > 0 ? (
              <Tooltip title="Delete">
                <IconButton aria-label="Delete" onClick={this.deleteSelected.bind(this)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Add receiver">
                <IconButton aria-label="Add receiver" onClick={this.addDistribution.bind(this)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Toolbar>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {distributions.map((row, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell component="th" scope="row">
                    <Checkbox checked={row.selected} onClick={this.handleChange.bind(this, idx, 'selected')} />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.address}
                      className={classes.input}
                      inputProps={{
                        'aria-label': 'Address',
                      }}
                      onChange={this.handleChange.bind(this, idx, 'address')}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell style={{width: 310}}>
                    <Input
                      value={row.percentage}
                      className={classes.inputSlider}
                      inputProps={{
                        'aria-label': 'Percentage',
                      }}
                      onChange={this.handleChange.bind(this, idx, 'percentage')}
                      type='range'
                      fullWidth
                      endAdornment={
                        <InputAdornment className={classes.inputAdornment} position="end">
                          {row.percentage}%
                        </InputAdornment>
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                Sum of percentages
              </TableCell>
              <TableCell>
                <span style={{color: sumColor}}>{totalPercentages}%</span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    )
  }

  renderNewContractAddress(){
    const { newContractAddress } = this.state;
    const { classes } = this.props;

    if (!newContractAddress) return;

    return (
      <Paper className={classes.root}>
        <h2>Contract deployed at the address below</h2>
        <p>Send money to it and it will be split</p>
        <div>
          <Input
            id='newContractAddress'
            value={newContractAddress}
            className={classes.newContractAddress}
            readOnly
          />
          <Tooltip title="Copy">
            <IconButton aria-label="Copy" onClick={this.copyNewContractAddress.bind(this)}>
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Paper>
    )
  }

  render() {
    const { classes } = this.props;

    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <h1>Deconet Payment Splitting dApp</h1>
        <p>Enter receivers and the percentages they should receive, and deploy.  Any ETH that is sent into the contract will be split according to the percentages you've chosen.</p>
        {this.renderTable()}
        {this.renderNewContractAddress()}
        <Button variant="raised" color="primary" className={classes.button} onClick={this.deploy.bind(this)}>
          Deploy
        </Button>
      </div>
    );
  }
}

export default withStyles(styles)(App);
