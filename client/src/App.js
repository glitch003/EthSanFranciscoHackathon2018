import React, { Component } from "react";
// import SplitterConverterFactory from "./contracts/SplitterConverterFactory.json";
import SplitterConverter from "./contracts/SplitterConverter.json";
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
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';

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
    maxWidth: 1440,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  table: {
    minWidth: 200,
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
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 90,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
});

const tokenPairs = [{"symbol":"ETH","cmcName":"ETH","name":"Ethereum","decimals":18,"contractAddress":"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"},{"symbol":"KNC","cmcName":"KNC","name":"Kyber Network","decimals":18,"contractAddress":"0x4E470dc7321E84CA96FcAEDD0C8aBCebbAEB68C6"},{"symbol":"OMG","cmcName":"OMG","name":"OmiseGO","decimals":18,"contractAddress":"0x4BFBa4a8F28755Cb2061c413459EE562c6B9c51b"},{"symbol":"SNT","cmcName":"SNT","name":"Status Network","decimals":18,"contractAddress":"0xbF5d8683b9BE6C43fcA607eb2a6f2626A18837a6"},{"symbol":"ELF","cmcName":"ELF","name":"AELF","decimals":18,"contractAddress":"0x9Fcc27c7320703c43368cf1A4bf076402cd0D6B4"},{"symbol":"POWR","cmcName":"POWR","name":"Power Ledger","decimals":6,"contractAddress":"0xa577731515303F0C0D00E236041855A5C4F114dC"},{"symbol":"MANA","cmcName":"MANA","name":"Decentraland","decimals":18,"contractAddress":"0xf5E314c435B3B2EE7c14eA96fCB3307C3a3Ef608"},{"symbol":"BAT","cmcName":"BAT","name":"Basic Attention Token","decimals":18,"contractAddress":"0xDb0040451F373949A4Be60dcd7b6B8D6E42658B6"},{"symbol":"REQ","cmcName":"REQ","name":"Request","decimals":18,"contractAddress":"0xb43D10BbE7222519Da899B72bF2c7f094b6F79D7"},{"symbol":"GTO","cmcName":"GTO","name":"GIFTO","decimals":5,"contractAddress":"0xe55c607d58c53b2B06A8E38f67F4c0FcAeEd2c31"},{"symbol":"RDN","cmcName":"RDN","name":"Raiden","decimals":18,"contractAddress":"0x5422Ef695ED0B1213e2B953CFA877029637D9D26"},{"symbol":"APPC","cmcName":"APPC","name":"AppCoins","decimals":18,"contractAddress":"0x2799f05B55d56be756Ca01Af40Bf7350787F48d4"},{"symbol":"ENG","cmcName":"ENG","name":"Enigma","decimals":8,"contractAddress":"0x95cc8d8f29D0f7fcC425E8708893E759d1599c97"},{"symbol":"SALT","cmcName":"SALT","name":"Salt","decimals":8,"contractAddress":"0xB47f1A9B121BA114d5e98722a8948e274d0F4042"},{"symbol":"BQX","cmcName":"BQX","name":"Ethos","decimals":8,"contractAddress":"0x9504A86A881F63Da06302FB3639d4582022097DB"},{"symbol":"ADX","cmcName":"ADX","name":"AdEx","decimals":4,"contractAddress":"0x499990DB50b34687CDaFb2C8DaBaE4E99d6F38A7"},{"symbol":"AST","cmcName":"AST","name":"AirSwap","decimals":4,"contractAddress":"0xeF06F410C26a0fF87b3a43927459Cce99268a2eF"},{"symbol":"RCN","cmcName":"RCN","name":"Ripio Credit Network","decimals":18,"contractAddress":"0x99338aa9218C6C23AA9d8cc2f3EFaf29954ea26B"},{"symbol":"ZIL","cmcName":"ZIL","name":"Zilliqa","decimals":12,"contractAddress":"0xaD78AFbbE48bA7B670fbC54c65708cbc17450167"},{"symbol":"DAI","cmcName":"DAI","name":"DAI","decimals":18,"contractAddress":"0xaD6D458402F60fD3Bd25163575031ACDce07538D"},{"symbol":"LINK","cmcName":"LINK","name":"Chain Link","decimals":18,"contractAddress":"0xb4f7332ed719Eb4839f091EDDB2A3bA309739521"},{"symbol":"IOST","cmcName":"IOST","name":"IOStoken","decimals":18,"contractAddress":"0x27db28a6C4ac3D82a08D490cfb746E6F02bC467C"},{"symbol":"STORM","cmcName":"STORM","name":"Storm","decimals":18,"contractAddress":"0x8FFf7De21de8ad9c510704407337542073FDC44b"},{"symbol":"BBO","cmcName":"BBO","name":"BigBom","decimals":18,"contractAddress":"0xa94758d328af7ef1815e73053e95b5F86588C16D"},{"symbol":"COFI","cmcName":"COFI","name":"ConFi","decimals":18,"contractAddress":"0xb91786188f8d4e35d6d67799e9f162587bf4da03"},{"symbol":"MOC","cmcName":"MOC","name":"Moss Coin","decimals":18,"contractAddress":"0x1742c81075031b8f173d2327e3479d1fc3feaa76"},{"symbol":"BITX","cmcName":"BITX","name":"BitScreenerToken","decimals":18,"contractAddress":"0x7a17267576318efb728bc4a0833e489a46ba138f"}]

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    loaded: false,
    deploying: false,
    newContractAddress: null,
    distributions: [
      {
        address: '',
        percentage: 0,
        selected: false,
        outCurrency: 'ETH'
      },
      {
        address: '',
        percentage: 0,
        selected: false,
        outCurrency: 'ETH'
      }
    ],
    windowWidth: null
  };

  async componentDidMount() {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      // const Contract = truffleContract(SplitterConverterFactory);
      // Contract.setProvider(web3.currentProvider);
      // const instance = await Contract.deployed();

      // console.log(instance)

      window.web3js = web3;

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, loaded: true, windowWidth: window.innerWidth });

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

  withdraw() {
    const { web3, newContractAddress, accounts, contract } = this.state;
    // console.log('abi: ', SplitterConverter.abi)
    // const splitterContract = new web3.eth.Contract(SplitterConverter.abi, newContractAddress);
    // console.log('splitterContract', splitterContract)
    contract.methods.withdraw().send({ from: accounts[0] })
    .on('transactionHash', (hash) => {
      console.log(hash);
      const url = `https://ropsten.etherscan.io/tx/${hash}`
      window.open(url, '_blank');
    })
    .on('error', console.error); // If a out of gas error, the second parameter is the receipt
  }

  deploy() {
    const { web3, accounts } = this.state;
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

    const outCurrencies = distributions.map(d => {
      for(let i = 0; i < tokenPairs.length; i++){
        if (tokenPairs[i].symbol == d.outCurrency) {
          return tokenPairs[i].contractAddress;
        }
      }
    })
    console.log(outCurrencies)

    // const destinations = ["0xb962537314b11c6bcd6d9ff63feb048a9e91e7ae", "0xa2266e01703e4ca0ffc4b374635acdbdabda7793"]
    // const percentages = [90,10]
    // // eth and DAI
    // const outCurrencies = ["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "0xaD6D458402F60fD3Bd25163575031ACDce07538D"]

    const splitterContract = new web3.eth.Contract(SplitterConverter.abi);
    splitterContract.deploy({
      data: SplitterConverter.bytecode,
      arguments: [destinations, percentages, outCurrencies]
    }).send({ from: accounts[0] })
    .on('transactionHash', (hash) => {
      this.setState({deploying: true})
    })
    .on('receipt', (receipt) => {
      console.log(receipt)

      this.setState({
        newContractAddress: receipt.contractAddress,
        deploying: false,
        contract: new web3.eth.Contract(SplitterConverter.abi, receipt.contractAddress)
      })
    })
    .on('error', console.error); // If a out of gas error, the second parameter is the receipt.
  }

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
        distributions: [...prevState.distributions, {address: '', percentage: 0, selected: false, outCurrency: 'ETH'}]
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
    const { distributions, windowWidth } = this.state;
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

    const showSelectColumn = windowWidth > 1000;

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
              { showSelectColumn ? <TableCell>Select</TableCell> : null }
              <TableCell>Address</TableCell>
              <TableCell>Percentage</TableCell>
              <TableCell>Output Currency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {distributions.map((row, idx) => {
              return (
                <TableRow key={idx}>
                  { showSelectColumn ?
                    <TableCell component="th" scope="row">
                      <Checkbox checked={row.selected} onClick={this.handleChange.bind(this, idx, 'selected')} />
                    </TableCell>
                    : null
                  }
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
                    { showSelectColumn ?
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
                      :
                      <Input
                        value={row.percentage}
                        className={classes.input}
                        inputProps={{
                          'aria-label': 'Percentage',
                        }}
                        onChange={this.handleChange.bind(this, idx, 'percentage')}
                        fullWidth
                        endAdornment={
                          <InputAdornment className={classes.inputAdornment} position="end">
                            %
                          </InputAdornment>
                        }
                      />
                    }
                  </TableCell>
                  <TableCell>
                    <FormControl className={classes.formControl}>
                      <Select
                        value={row.outCurrency}
                        onChange={this.handleChange.bind(this, idx, 'outCurrency')}
                        inputProps={{
                          name: 'outCurrency' + idx,
                          id: 'outCurrency-'+idx,
                        }}
                      >
                        {
                          tokenPairs.map(t => {
                            return (
                              <MenuItem key={t.symbol} value={t.symbol}>{t.symbol}</MenuItem>
                            )
                          })
                        }
                      </Select>
                    </FormControl>
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
    const { newContractAddress, deploying } = this.state;
    const { classes } = this.props;

    if (!newContractAddress && deploying) {
      return (
        <Paper className={classes.root}>
          <h2>Deploying...</h2>
          <CircularProgress className={classes.progress} />
        </Paper>
      )
    }

    if (!newContractAddress) return;

    return (
      <Paper className={classes.root}>
        <h2>Contract deployed at the address below</h2>
        <p>Send ETH or DAI to it and it will be split</p>
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
        <div>
          Once the contract has a balance of ETH or DAI (or both), you can withdraw:
        </div>
        <div>
          <Button variant="raised" color="secondary" className={classes.button} style={{marginBottom: 40}} onClick={this.withdraw.bind(this)}>
            Withdraw
          </Button>
        </div>
      </Paper>
    )
  }

  render() {
    const { classes } = this.props;
    const { newContractAddress, deploying } = this.state;

    if (!this.state.loaded) {
      return (
        <div className="App">
          <h1>Loading Web3, accounts, and contract...</h1>
          <div><CircularProgress className={classes.progress} /></div>
        </div>
      );
    }

    return (
      <div className="App">
        <h1>Payment Splitting and Converting dApp</h1>
        <p>Enter receivers, the percentages they should receive, and their desired output currencies, and deploy.  Any ETH or DAI that is sent into the contract will be split according to the percentages you've chosen then converted into the desired output currency.</p>
        {this.renderTable()}
        {this.renderNewContractAddress()}
        {newContractAddress == null && !deploying ?
          <Button variant="raised" color="primary" className={classes.button} onClick={this.deploy.bind(this)}>
            Deploy
          </Button>
          : null
        }
      </div>
    );
  }
}

export default withStyles(styles)(App);
